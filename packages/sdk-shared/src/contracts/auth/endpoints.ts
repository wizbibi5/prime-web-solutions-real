/**
 * Auth Endpoints Contract
 *
 * Defines the endpoint paths for authentication operations.
 * These paths match the backend routes mounted at /api/v1/auth/*.
 *
 * Frontend authService uses these endpoints to communicate with the backend.
 */

export const AUTH_ENDPOINTS = {
  /**
   * Sign up a new user
   * POST /api/v1/auth/signup
   */
  SIGNUP: '/api/v1/auth/signup',

  /**
   * Sign in an existing user
   * POST /api/v1/auth/signin
   */
  SIGNIN: '/api/v1/auth/signin',

  /**
   * Sign out the current user
   * POST /api/v1/auth/signout
   */
  SIGNOUT: '/api/v1/auth/signout',

  /**
   * Refresh the access token
   * POST /api/v1/auth/refresh
   */
  REFRESH: '/api/v1/auth/refresh',

  /**
   * Get the current session
   * GET /api/v1/auth/session
   */
  SESSION: '/api/v1/auth/session',

  /**
   * Request password reset
   * POST /api/v1/auth/reset-password
   */
  RESET_PASSWORD: '/api/v1/auth/reset-password',
} as const;

export type AuthEndpoint = (typeof AUTH_ENDPOINTS)[keyof typeof AUTH_ENDPOINTS];
