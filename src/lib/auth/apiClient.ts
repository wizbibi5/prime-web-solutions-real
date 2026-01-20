/**
 * API Client
 *
 * Authenticated HTTP client for making requests to the backend.
 *
 * ## Features
 *
 * - Automatic JWT token injection via Bearer header
 * - Token caching with 5-minute expiry buffer
 * - Automatic token refresh on 401 responses
 * - Configurable timeout (default 30s)
 * - Retry logic after token refresh
 *
 * ## Response Handling
 *
 * The apiClient expects backend responses in this format:
 * ```json
 * {
 *   "success": true,
 *   "data": { ... }  // Your actual response data
 * }
 * ```
 *
 * The client unwraps this and returns:
 * ```typescript
 * {
 *   success: true,
 *   data: { ... }  // The unwrapped data from backend
 * }
 * ```
 *
 * ## Building Services & Hooks
 *
 * The recommended pattern is: apiClient → Service → Hook
 *
 * ### 1. Create a Service (wraps apiClient)
 *
 * ```typescript
 * // services/productService.ts
 * import { apiClient } from '@/lib/auth';
 *
 * export interface Product {
 *   id: string;
 *   name: string;
 *   price: number;
 * }
 *
 * export const productService = {
 *   async getAll(): Promise<Product[]> {
 *     const result = await apiClient.get<Product[]>('/api/v1/products');
 *     if (!result.success) {
 *       throw new Error(result.error || 'Failed to fetch products');
 *     }
 *     return result.data!;
 *   },
 *
 *   async create(product: Omit<Product, 'id'>): Promise<Product> {
 *     const result = await apiClient.post<Product>('/api/v1/products', product);
 *     if (!result.success) {
 *       throw new Error(result.error || 'Failed to create product');
 *     }
 *     return result.data!;
 *   },
 * };
 * ```
 *
 * ### 2. Create a Hook (wraps Service)
 *
 * ```typescript
 * // hooks/useProducts.ts
 * import { useState, useEffect, useCallback } from 'react';
 * import { productService, Product } from '@/services/productService';
 *
 * export function useProducts() {
 *   const [products, setProducts] = useState<Product[]>([]);
 *   const [loading, setLoading] = useState(true);
 *   const [error, setError] = useState<string | null>(null);
 *
 *   const fetchProducts = useCallback(async () => {
 *     setLoading(true);
 *     setError(null);
 *     try {
 *       const data = await productService.getAll();
 *       setProducts(data);
 *     } catch (err) {
 *       setError(err instanceof Error ? err.message : 'Unknown error');
 *     } finally {
 *       setLoading(false);
 *     }
 *   }, []);
 *
 *   useEffect(() => {
 *     fetchProducts();
 *   }, [fetchProducts]);
 *
 *   return { products, loading, error, refetch: fetchProducts };
 * }
 * ```
 *
 * ### 3. Use in Components
 *
 * ```tsx
 * function ProductList() {
 *   const { products, loading, error } = useProducts();
 *
 *   if (loading) return <Spinner />;
 *   if (error) return <Error message={error} />;
 *
 *   return (
 *     <ul>
 *       {products.map(p => <li key={p.id}>{p.name}</li>)}
 *     </ul>
 *   );
 * }
 * ```
 */

import { supabase } from '@/lib/supabase';

// =============================================================================
// Token Cache
// =============================================================================

let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

// Buffer before expiry (5 minutes in ms)
const EXPIRY_BUFFER = 5 * 60 * 1000;

/**
 * Get a valid access token.
 * Uses cached token if valid, otherwise gets fresh from Supabase.
 */
async function getValidToken(): Promise<string> {
  const now = Date.now();

  // Try cached token if valid
  if (cachedToken && tokenExpiry && now < tokenExpiry - EXPIRY_BUFFER) {
    return cachedToken;
  }

  // Get session from Supabase
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('No authenticated session. Please sign in first.');
  }

  // Check if token needs refresh
  const expiresAt = session.expires_at ? session.expires_at * 1000 : 0;
  if (expiresAt && now > expiresAt - EXPIRY_BUFFER) {
    // Refresh the session
    const { data: { session: refreshedSession }, error } = await supabase.auth.refreshSession();

    if (error || !refreshedSession) {
      throw new Error('Failed to refresh authentication token');
    }

    cachedToken = refreshedSession.access_token;
    tokenExpiry = refreshedSession.expires_at ? refreshedSession.expires_at * 1000 : now + 3600000;
    return cachedToken;
  }

  // Use current token
  cachedToken = session.access_token;
  tokenExpiry = expiresAt || now + 3600000;
  return cachedToken;
}

/**
 * Clear the token cache.
 */
export function clearTokenCache(): void {
  cachedToken = null;
  tokenExpiry = null;
}

// =============================================================================
// Types
// =============================================================================

/**
 * Standard API response format.
 *
 * @template T - The type of the data payload
 *
 * @example
 * ```typescript
 * // Success response
 * { success: true, data: { id: '123', name: 'Widget' } }
 *
 * // Error response
 * { success: false, error: 'Not found' }
 * ```
 */
export interface ApiResponse<T = unknown> {
  /** Whether the request succeeded */
  success: boolean;
  /** The response data (present on success) */
  data?: T;
  /** Error message (present on failure) */
  error?: string;
  /** Optional message from server */
  message?: string;
}

/**
 * Options for API requests.
 */
export interface RequestOptions {
  /** Additional headers to include */
  headers?: Record<string, string>;
  /** Skip authentication (for public endpoints) */
  skipAuth?: boolean;
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Expected backend response format.
 * Backend should return responses in this shape.
 */
interface BackendResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// =============================================================================
// API Client Class
// =============================================================================

/**
 * HTTP client with automatic JWT authentication.
 *
 * @example
 * ```typescript
 * import { apiClient } from '@/lib/auth';
 *
 * // GET request
 * const result = await apiClient.get<User[]>('/api/v1/users');
 * if (result.success) {
 *   console.log(result.data); // User[]
 * }
 *
 * // POST request
 * const created = await apiClient.post<User>('/api/v1/users', { name: 'John' });
 * ```
 */
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.NEXT_PUBLIC_BACKEND_URL || '';
  }

  /**
   * Make an authenticated HTTP request.
   *
   * @template T - Expected type of response data
   * @param method - HTTP method
   * @param path - API path (e.g., '/api/v1/users')
   * @param body - Request body (for POST, PUT, PATCH)
   * @param options - Request options
   * @returns ApiResponse with typed data
   */
  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${path.startsWith('/') ? path : `/${path}`}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth header if not skipped
    if (!options.skipAuth) {
      try {
        const token = await getValidToken();
        headers['Authorization'] = `Bearer ${token}`;
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Authentication failed',
        };
      }
    }

    try {
      // Create abort controller for timeout
      const timeoutMs = options.timeout || 30000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const json = await response.json() as BackendResponse<T>;

      // Handle 401 - try to refresh token and retry
      if (response.status === 401 && !options.skipAuth) {
        console.log('[ApiClient] Token rejected, attempting refresh...');
        clearTokenCache();

        try {
          // Refresh the Supabase session
          const { data: { session: refreshedSession }, error: refreshError } =
            await supabase.auth.refreshSession();

          if (refreshError || !refreshedSession) {
            return { success: false, error: 'Session expired. Please sign in again.' };
          }

          // Retry with fresh token
          headers['Authorization'] = `Bearer ${refreshedSession.access_token}`;
          cachedToken = refreshedSession.access_token;
          tokenExpiry = refreshedSession.expires_at
            ? refreshedSession.expires_at * 1000
            : Date.now() + 3600000;

          const retryResponse = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
          });

          const retryJson = await retryResponse.json() as BackendResponse<T>;

          if (!retryResponse.ok || !retryJson.success) {
            return {
              success: false,
              error: retryJson.error || retryJson.message || 'Request failed after token refresh',
            };
          }

          // Return unwrapped data
          return {
            success: true,
            data: retryJson.data,
            message: retryJson.message,
          };
        } catch {
          return { success: false, error: 'Authentication failed after retry' };
        }
      }

      // Handle error responses
      if (!response.ok || !json.success) {
        return {
          success: false,
          error: json.error || json.message || `Request failed with status ${response.status}`,
        };
      }

      // Return unwrapped data
      return {
        success: true,
        data: json.data,
        message: json.message,
      };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutSec = Math.round((options.timeout || 30000) / 1000);
        return {
          success: false,
          error: `Request timed out after ${timeoutSec} seconds`,
        };
      }
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Make a GET request.
   *
   * @example
   * ```typescript
   * const result = await apiClient.get<User[]>('/api/v1/users');
   * if (result.success) {
   *   result.data.forEach(user => console.log(user.name));
   * }
   * ```
   */
  async get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, options);
  }

  /**
   * Make a POST request.
   *
   * @example
   * ```typescript
   * const result = await apiClient.post<User>('/api/v1/users', {
   *   name: 'John',
   *   email: 'john@example.com'
   * });
   * ```
   */
  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body, options);
  }

  /**
   * Make a PATCH request.
   */
  async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', path, body, options);
  }

  /**
   * Make a PUT request.
   */
  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body, options);
  }

  /**
   * Make a DELETE request.
   */
  async delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, options);
  }
}

// =============================================================================
// Default Instance
// =============================================================================

/**
 * Pre-configured API client instance.
 * Uses NEXT_PUBLIC_BACKEND_URL as base URL.
 */
export const apiClient = new ApiClient();
