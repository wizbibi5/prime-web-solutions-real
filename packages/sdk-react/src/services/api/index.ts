/**
 * Authenticated Client - @zylo/sdk-react
 *
 * A general-purpose HTTP client for making JWT-authenticated requests to ANY
 * backend endpoint. This is the "plug-and-play" client for protected routes.
 *
 * ## Architecture Overview
 *
 * The Zylo SDK has two distinct layers for API communication:
 *
 * ### 1. authService (Fixed Auth Endpoints)
 * Handles the standard authentication endpoints that are consistent across
 * all Zylo applications:
 * - `/auth/signup` - User registration
 * - `/auth/signin` - User login
 * - `/auth/signout` - User logout
 * - `/auth/refresh` - Token refresh
 * - `/auth/reset-password` - Password reset
 *
 * These endpoints are built into the Zylo backend boilerplate and never change.
 *
 * ### 2. authenticatedClient (Dynamic Custom Endpoints)
 * This client is for ANY custom endpoint that users/agents add to their backend.
 * When a user adds a new protected API route (e.g., `/api/products`, `/api/orders`),
 * the frontend service for that feature should use `authenticatedClient` to:
 * - Automatically inject the JWT Bearer token
 * - Handle token refresh if expired
 * - Retry on 401 with fresh token
 *
 * ## Usage Pattern
 *
 * When agents create new features with protected backend endpoints, they should:
 *
 * 1. Create a service file that uses authenticatedClient
 * 2. Define typed methods for each endpoint
 * 3. Optionally wrap in hooks/context for React components
 *
 * @example
 * ```typescript
 * // services/productService.ts - Agent-generated service for "products" feature
 * import { authenticatedClient } from '@zylo/sdk-react';
 *
 * export interface Product {
 *   id: string;
 *   name: string;
 *   price: number;
 * }
 *
 * export const productService = {
 *   // GET /api/products
 *   async getAll() {
 *     return authenticatedClient.get<Product[]>('/api/products');
 *   },
 *
 *   // POST /api/products
 *   async create(data: Omit<Product, 'id'>) {
 *     return authenticatedClient.post<Product>('/api/products', data);
 *   },
 *
 *   // GET /api/products/:id
 *   async getById(id: string) {
 *     return authenticatedClient.get<Product>(`/api/products/${id}`);
 *   },
 *
 *   // PATCH /api/products/:id
 *   async update(id: string, data: Partial<Product>) {
 *     return authenticatedClient.patch<Product>(`/api/products/${id}`, data);
 *   },
 *
 *   // DELETE /api/products/:id
 *   async delete(id: string) {
 *     return authenticatedClient.delete(`/api/products/${id}`);
 *   },
 * };
 * ```
 *
 * @example
 * ```typescript
 * // For public endpoints (no auth required), use skipAuth option:
 * const { data } = await authenticatedClient.get('/api/public/health', { skipAuth: true });
 * ```
 */

import { authService } from '../auth/index.js';

// Token cache for quick access
let cachedToken: string | null = null;
let tokenExpiry: number | null = null;

// Buffer before expiry (5 minutes in ms)
const EXPIRY_BUFFER = 5 * 60 * 1000;

/**
 * Get a valid access token from the auth service.
 * Tries cached token first, refreshes if expired or missing.
 */
async function getValidToken(): Promise<string> {
  const now = Date.now();

  // Try cached token if valid
  if (cachedToken && tokenExpiry && now < tokenExpiry - EXPIRY_BUFFER) {
    return cachedToken;
  }

  // Try to get session from auth service
  const session = await authService.getSession();

  if (!session) {
    throw new Error('No authenticated session. Please sign in first.');
  }

  // Cache the token
  cachedToken = session.accessToken;
  tokenExpiry = new Date(session.expiresAt).getTime();

  return session.accessToken;
}

/**
 * Clear the token cache.
 * Call this when you need to force a fresh token on next request.
 */
export function clearTokenCache(): void {
  cachedToken = null;
  tokenExpiry = null;
}

/**
 * Standard API response shape returned by authenticatedClient.
 */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Request options for authenticatedClient methods.
 */
export interface RequestOptions {
  /** Additional headers to include in the request */
  headers?: Record<string, string>;
  /** Skip JWT authentication (for public endpoints) */
  skipAuth?: boolean;
  /** Custom timeout in milliseconds (default: 30000) */
  timeout?: number;
}

/**
 * Get the API base URL.
 * Priority: NEXT_PUBLIC_BACKEND_URL env var > window.__ZYLO_CONFIG__ > relative URL
 */
function getBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }

  if (typeof window !== 'undefined') {
    const windowConfig = (window as any).__ZYLO_CONFIG__;
    if (windowConfig?.apiUrl) {
      return windowConfig.apiUrl;
    }
  }

  // Fall back to relative URLs (same-origin)
  return '';
}

/**
 * Authenticated HTTP Client for making JWT-protected requests.
 *
 * This client automatically:
 * - Injects the JWT Bearer token from the current session
 * - Refreshes expired tokens before making requests
 * - Retries requests on 401 with a fresh token
 * - Handles timeouts and network errors gracefully
 *
 * Use this client for ANY custom protected endpoint in your backend.
 * For standard auth operations (login, signup, etc.), use authService instead.
 */
export class AuthenticatedClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl ?? getBaseUrl();
  }

  /**
   * Internal method to make an HTTP request with JWT authentication.
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
      const timeoutMs = options.timeout ?? 30000;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

      const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      // Handle 401 with retry using fresh token
      if (response.status === 401 && !options.skipAuth) {
        console.log('[AuthenticatedClient] Token rejected, retrying with fresh token...');
        clearTokenCache();

        try {
          const freshToken = await getValidToken();
          headers['Authorization'] = `Bearer ${freshToken}`;

          const retryResponse = await fetch(url, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined,
          });

          const retryData = await retryResponse.json();

          if (!retryResponse.ok) {
            return {
              success: false,
              error: retryData.error || retryData.message || 'Request failed',
              ...retryData,
            };
          }

          return { success: true, data: retryData, ...retryData };
        } catch {
          return { success: false, error: 'Authentication failed after retry' };
        }
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || data.message || `Request failed with status ${response.status}`,
          ...data,
        };
      }

      return { success: true, data, ...data };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        const timeoutSec = Math.round((options.timeout ?? 30000) / 1000);
        console.error(`[AuthenticatedClient] Request timeout after ${timeoutSec}s:`, url);
        return {
          success: false,
          error: `Request timed out after ${timeoutSec} seconds`,
        };
      }
      console.error('[AuthenticatedClient] Network error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  /**
   * Make a GET request to any endpoint.
   *
   * @param path - The API path (e.g., '/api/products', '/api/users/123')
   * @param options - Request options (headers, skipAuth, timeout)
   */
  async get<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('GET', path, undefined, options);
  }

  /**
   * Make a POST request to any endpoint.
   *
   * @param path - The API path (e.g., '/api/products')
   * @param body - The request body (will be JSON stringified)
   * @param options - Request options (headers, skipAuth, timeout)
   */
  async post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('POST', path, body, options);
  }

  /**
   * Make a PATCH request to any endpoint.
   *
   * @param path - The API path (e.g., '/api/products/123')
   * @param body - The request body (will be JSON stringified)
   * @param options - Request options (headers, skipAuth, timeout)
   */
  async patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PATCH', path, body, options);
  }

  /**
   * Make a PUT request to any endpoint.
   *
   * @param path - The API path (e.g., '/api/products/123')
   * @param body - The request body (will be JSON stringified)
   * @param options - Request options (headers, skipAuth, timeout)
   */
  async put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('PUT', path, body, options);
  }

  /**
   * Make a DELETE request to any endpoint.
   *
   * @param path - The API path (e.g., '/api/products/123')
   * @param options - Request options (headers, skipAuth, timeout)
   */
  async delete<T>(path: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.request<T>('DELETE', path, undefined, options);
  }
}

/**
 * Default authenticated client instance.
 *
 * Use this for making JWT-authenticated requests to any custom backend endpoint.
 * The base URL is automatically configured from NEXT_PUBLIC_BACKEND_URL.
 *
 * @example
 * ```typescript
 * import { authenticatedClient } from '@zylo/sdk-react';
 *
 * // GET request with automatic JWT injection
 * const { data, error } = await authenticatedClient.get('/api/products');
 *
 * // POST request
 * const { data } = await authenticatedClient.post('/api/orders', { items: [...] });
 *
 * // Public endpoint (skip auth)
 * const { data } = await authenticatedClient.get('/api/public/info', { skipAuth: true });
 * ```
 */
export const authenticatedClient = new AuthenticatedClient();

// Re-export class as ApiClient for backwards compatibility
export { AuthenticatedClient as ApiClient };

// Re-export instance as apiClient for backwards compatibility
export { authenticatedClient as apiClient };
