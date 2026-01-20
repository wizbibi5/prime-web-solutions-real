/**
 * Auth Schemas Contract
 *
 * Request and response type definitions for auth endpoints.
 * These types are shared between frontend and backend SDKs.
 */

// ============================================================
// User Types
// ============================================================

/**
 * App user as returned from auth operations.
 * Represents an end-user of a Zylo-built application.
 */
export interface ZyloAppUser {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  projectId: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, unknown>;
}

/**
 * Auth session containing user and tokens.
 */
export interface ZyloAuthSession {
  user: ZyloAppUser;
  accessToken: string;
  refreshToken: string;
  expiresAt: string;
}

// ============================================================
// Sign Up
// ============================================================

/**
 * Request body for signup endpoint.
 */
export interface SignUpRequest {
  email: string;
  password: string;
  displayName?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Response from signup endpoint.
 */
export interface SignUpResponse {
  success: boolean;
  session?: ZyloAuthSession;
  error?: AuthErrorResponse;
}

// ============================================================
// Sign In
// ============================================================

/**
 * Request body for signin endpoint.
 */
export interface SignInRequest {
  email: string;
  password: string;
}

/**
 * Response from signin endpoint.
 */
export interface SignInResponse {
  success: boolean;
  session?: ZyloAuthSession;
  error?: AuthErrorResponse;
}

// ============================================================
// Sign Out
// ============================================================

/**
 * Request body for signout endpoint.
 */
export interface SignOutRequest {
  accessToken: string;
}

/**
 * Response from signout endpoint.
 */
export interface SignOutResponse {
  success: boolean;
  error?: AuthErrorResponse;
}

// ============================================================
// Refresh Token
// ============================================================

/**
 * Request body for refresh endpoint.
 */
export interface RefreshTokenRequest {
  refreshToken: string;
}

/**
 * Response from refresh endpoint.
 */
export interface RefreshTokenResponse {
  success: boolean;
  session?: ZyloAuthSession;
  error?: AuthErrorResponse;
}

// ============================================================
// Get Session
// ============================================================

/**
 * Response from session endpoint.
 */
export interface GetSessionResponse {
  success: boolean;
  session?: ZyloAuthSession | null;
  error?: AuthErrorResponse;
}

// ============================================================
// Password Reset
// ============================================================

/**
 * Request body for password reset endpoint.
 */
export interface ResetPasswordRequest {
  email: string;
}

/**
 * Response from password reset endpoint.
 */
export interface ResetPasswordResponse {
  success: boolean;
  error?: AuthErrorResponse;
}

// ============================================================
// Error Types
// ============================================================

/**
 * Standard error response from auth endpoints.
 */
export interface AuthErrorResponse {
  code: AuthErrorCode;
  message: string;
  details?: Record<string, unknown>;
}

/**
 * Auth error codes for programmatic handling.
 */
export type AuthErrorCode =
  | 'INVALID_CREDENTIALS'
  | 'USER_NOT_FOUND'
  | 'USER_ALREADY_EXISTS'
  | 'INVALID_TOKEN'
  | 'TOKEN_EXPIRED'
  | 'WEAK_PASSWORD'
  | 'INVALID_EMAIL'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'NETWORK_ERROR'
  | 'UNAUTHORIZED'
  | 'HMAC_VERIFICATION_FAILED';
