/**
 * Auth Service - @zylo/sdk-react
 *
 * Client-side authentication service.
 * Calls backend API endpoints which handle HMAC signing and Edge Function communication.
 */

import type {
  SignUpRequest,
  SignUpResponse,
  SignInRequest,
  SignInResponse,
  SignOutResponse,
  RefreshTokenResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  ZyloAuthSession,
  AuthErrorResponse,
  AuthErrorCode,
} from '@zylo/sdk-shared';
import { AUTH_ENDPOINTS as ENDPOINTS } from '@zylo/sdk-shared';

// ============================================================
// Configuration
// ============================================================

/**
 * Internal configuration state
 */
let _configuredApiUrl: string | null = null;

/**
 * Configure the auth service with custom settings.
 * Call this before using any auth methods if you need to override defaults.
 *
 * @example
 * ```tsx
 * import { configureAuth } from '@zylo/sdk-react';
 *
 * // In your app initialization
 * configureAuth({
 *   apiUrl: 'https://api.myapp.com',
 * });
 * ```
 */
export function configureAuth(config: { apiUrl: string }): void {
  _configuredApiUrl = config.apiUrl;
}

/**
 * Get the API base URL.
 * Priority: 1. configureAuth() 2. window.__ZYLO_CONFIG__ 3. env var 4. empty (relative)
 */
function getApiUrl(): string {
  // 1. Check programmatic configuration
  if (_configuredApiUrl) {
    return _configuredApiUrl;
  }

  // 2. Client-side: check for window.__ZYLO_CONFIG__
  if (typeof window !== 'undefined') {
    const windowConfig = (window as any).__ZYLO_CONFIG__;
    if (windowConfig?.apiUrl) {
      return windowConfig.apiUrl;
    }
  }

  // 3. Try environment variable (works in Next.js, Vite, etc.)
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }

  // 4. Fall back to relative URLs (same-origin)
  return '';
}

// ============================================================
// Internal Helpers
// ============================================================

/**
 * Storage keys for session persistence
 */
const STORAGE_KEYS = {
  SESSION: 'zylo_session',
  ACCESS_TOKEN: 'zylo_access_token',
  REFRESH_TOKEN: 'zylo_refresh_token',
} as const;

/**
 * Decode a JWT payload without verification.
 * Used to extract claims like projectId for client-side validation.
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Decode base64url to base64
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = atob(base64);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

/**
 * Extract projectId from JWT access token.
 * The projectId is stored in app_metadata.project_id claim.
 */
export function getProjectIdFromToken(accessToken: string): string | null {
  const payload = decodeJwtPayload(accessToken);
  if (!payload) return null;

  // Check app_metadata.project_id (Supabase JWT structure)
  const appMetadata = payload.app_metadata as Record<string, unknown> | undefined;
  if (appMetadata?.project_id && typeof appMetadata.project_id === 'string') {
    return appMetadata.project_id;
  }

  return null;
}

/**
 * Get stored session from localStorage
 */
function getStoredSession(): ZyloAuthSession | null {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION);
    if (!stored) return null;

    const session = JSON.parse(stored) as ZyloAuthSession;

    // Check if session is expired
    if (new Date(session.expiresAt) < new Date()) {
      clearStoredSession();
      return null;
    }

    return session;
  } catch {
    return null;
  }
}

/**
 * Store session in localStorage
 */
function storeSession(session: ZyloAuthSession): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session));
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, session.accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, session.refreshToken);
  } catch {
    console.warn('[Zylo SDK] Failed to store session in localStorage');
  }
}

/**
 * Clear stored session
 */
function clearStoredSession(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  } catch {
    console.warn('[Zylo SDK] Failed to clear session from localStorage');
  }
}

/**
 * Make an API request to the backend
 */
async function apiRequest<TRequest, TResponse>(
  endpoint: string,
  method: 'GET' | 'POST',
  body?: TRequest
): Promise<TResponse> {
  // Build full URL using API base URL
  const apiUrl = getApiUrl();
  const fullUrl = apiUrl ? `${apiUrl}${endpoint}` : endpoint;

  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body && method === 'POST') {
    options.body = JSON.stringify(body);
  }

  // Add auth header if we have a session
  const session = getStoredSession();
  if (session) {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${session.accessToken}`,
    };
  }

  const response = await fetch(fullUrl, options);
  const data = await response.json();

  if (!response.ok) {
    const error: AuthErrorResponse = data.error || {
      code: 'SERVER_ERROR' as AuthErrorCode,
      message: data.message || 'An unexpected error occurred',
    };
    throw new AuthServiceError(error.message, error.code, error.details);
  }

  return data as TResponse;
}

// ============================================================
// Error Class
// ============================================================

/**
 * Auth service error with typed error code
 */
export class AuthServiceError extends Error {
  constructor(
    message: string,
    public readonly code: AuthErrorCode,
    public readonly details?: Record<string, unknown>
  ) {
    super(getUserFriendlyMessage(message, code));
    this.name = 'AuthServiceError';
  }
}

/**
 * Map error codes/messages to user-friendly messages
 */
function getUserFriendlyMessage(message: string, code: string): string {
  // Check for common error patterns in message
  if (message.includes('already been registered') || message.includes('already exists')) {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (message.includes('Invalid login') || message.includes('invalid credentials')) {
    return 'Invalid email or password. Please try again.';
  }
  if (message.includes('password') && (message.includes('weak') || message.includes('short'))) {
    return 'Password is too weak. Please use at least 8 characters.';
  }

  // Check by error code
  switch (code) {
    case 'EMAIL_ALREADY_EXISTS':
    case 'USER_ALREADY_EXISTS':
      return 'An account with this email already exists. Please sign in instead.';
    case 'INVALID_CREDENTIALS':
      return 'Invalid email or password. Please try again.';
    case 'WEAK_PASSWORD':
      return 'Password is too weak. Please use at least 8 characters.';
    case 'INVALID_EMAIL':
      return 'Please enter a valid email address.';
    case 'PROJECT_NOT_FOUND':
      return 'Service configuration error. Please contact support.';
    case 'INVALID_SIGNATURE':
      return 'Authentication error. Please try again.';
    case 'NETWORK_ERROR':
      return 'Network error. Please check your connection and try again.';
    default:
      return message;
  }
}

// ============================================================
// Auth Service
// ============================================================

/**
 * Client-side authentication service.
 *
 * Provides methods for user authentication that call backend API endpoints.
 * The backend handles HMAC signing and Supabase Edge Function communication.
 *
 * @example
 * ```tsx
 * import { authService } from '@zylo/sdk-react';
 *
 * // Sign in
 * const session = await authService.signIn('user@example.com', 'password');
 *
 * // Get current session
 * const currentSession = await authService.getSession();
 *
 * // Sign out
 * await authService.signOut();
 * ```
 */
export const authService = {
  /**
   * Sign up a new user.
   *
   * @param email - User's email address
   * @param password - User's password (min 8 characters)
   * @param options - Optional metadata and display name
   * @returns Session with user and tokens
   */
  async signUp(
    email: string,
    password: string,
    options?: { displayName?: string; metadata?: Record<string, unknown> }
  ): Promise<ZyloAuthSession> {
    const request: SignUpRequest = {
      email,
      password,
      displayName: options?.displayName,
      metadata: options?.metadata,
    };

    const response = await apiRequest<SignUpRequest, SignUpResponse>(
      ENDPOINTS.SIGNUP,
      'POST',
      request
    );

    if (!response.success || !response.session) {
      throw new AuthServiceError(
        response.error?.message || 'Sign up failed',
        response.error?.code || 'SERVER_ERROR'
      );
    }

    storeSession(response.session);
    return response.session;
  },

  /**
   * Sign in an existing user.
   *
   * @param email - User's email address
   * @param password - User's password
   * @returns Session with user and tokens
   */
  async signIn(email: string, password: string): Promise<ZyloAuthSession> {
    const request: SignInRequest = { email, password };

    const response = await apiRequest<SignInRequest, SignInResponse>(
      ENDPOINTS.SIGNIN,
      'POST',
      request
    );

    if (!response.success || !response.session) {
      throw new AuthServiceError(
        response.error?.message || 'Sign in failed',
        response.error?.code || 'INVALID_CREDENTIALS'
      );
    }

    storeSession(response.session);
    return response.session;
  },

  /**
   * Sign out the current user.
   *
   * Clears local session storage and invalidates server session.
   */
  async signOut(): Promise<void> {
    const session = getStoredSession();

    if (session) {
      try {
        await apiRequest<{ accessToken: string }, SignOutResponse>(
          ENDPOINTS.SIGNOUT,
          'POST',
          { accessToken: session.accessToken }
        );
      } catch {
        // Continue with local signout even if server call fails
        console.warn('[Zylo SDK] Server signout failed, clearing local session');
      }
    }

    clearStoredSession();
  },

  /**
   * Get the current session.
   *
   * Returns cached session if valid, otherwise attempts to refresh.
   * @returns Current session or null if not authenticated
   */
  async getSession(): Promise<ZyloAuthSession | null> {
    const stored = getStoredSession();

    if (!stored) {
      return null;
    }

    // Check if session is about to expire (within 5 minutes)
    const expiresAt = new Date(stored.expiresAt);
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);

    if (expiresAt < fiveMinutesFromNow) {
      // Try to refresh
      const refreshed = await this.refreshSession();
      return refreshed;
    }

    return stored;
  },

  /**
   * Refresh the current session.
   *
   * Uses the refresh token to get a new access token.
   * @returns New session or null if refresh failed
   */
  async refreshSession(): Promise<ZyloAuthSession | null> {
    const stored = getStoredSession();

    if (!stored?.refreshToken) {
      return null;
    }

    try {
      const response = await apiRequest<{ refreshToken: string }, RefreshTokenResponse>(
        ENDPOINTS.REFRESH,
        'POST',
        { refreshToken: stored.refreshToken }
      );

      if (!response.success || !response.session) {
        clearStoredSession();
        return null;
      }

      storeSession(response.session);
      return response.session;
    } catch {
      clearStoredSession();
      return null;
    }
  },

  /**
   * Request a password reset email.
   *
   * @param email - User's email address
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    const request: ResetPasswordRequest = { email };

    const response = await apiRequest<ResetPasswordRequest, ResetPasswordResponse>(
      ENDPOINTS.RESET_PASSWORD,
      'POST',
      request
    );

    if (!response.success) {
      throw new AuthServiceError(
        response.error?.message || 'Failed to send password reset email',
        response.error?.code || 'SERVER_ERROR'
      );
    }
  },

  /**
   * Check if user is currently authenticated.
   *
   * @returns true if there's a valid session
   */
  isAuthenticated(): boolean {
    return getStoredSession() !== null;
  },

  /**
   * Get the current access token.
   *
   * @returns Access token or null
   */
  getAccessToken(): string | null {
    const session = getStoredSession();
    return session?.accessToken ?? null;
  },
};

export type AuthService = typeof authService;
