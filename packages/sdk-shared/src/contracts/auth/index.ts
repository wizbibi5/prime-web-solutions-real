/**
 * Auth Contracts
 *
 * Barrel export for auth contract definitions.
 */

export { AUTH_ENDPOINTS, type AuthEndpoint } from './endpoints.js';

export type {
  // User types
  ZyloAppUser,
  ZyloAuthSession,
  // Sign up
  SignUpRequest,
  SignUpResponse,
  // Sign in
  SignInRequest,
  SignInResponse,
  // Sign out
  SignOutRequest,
  SignOutResponse,
  // Refresh
  RefreshTokenRequest,
  RefreshTokenResponse,
  // Session
  GetSessionResponse,
  // Password reset
  ResetPasswordRequest,
  ResetPasswordResponse,
  // Errors
  AuthErrorResponse,
  AuthErrorCode,
} from './schemas.js';

export { AUTH_DOCS } from './docs.js';
