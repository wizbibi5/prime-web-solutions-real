/**
 * Services - @zylo/sdk-react
 *
 * Client-side services for auth and API communication.
 *
 * ## Service Architecture
 *
 * ### authService
 * Handles fixed authentication endpoints that are consistent across all Zylo apps:
 * - signUp, signIn, signOut, refreshSession, sendPasswordResetEmail
 * - Uses predefined endpoints: /auth/signup, /auth/signin, etc.
 *
 * ### authenticatedClient
 * General-purpose HTTP client for ANY custom protected endpoint.
 * Automatically injects JWT tokens, handles refresh, and retries on 401.
 * Use this when building services for custom backend routes.
 *
 * @example
 * ```typescript
 * // For auth operations, use authService
 * import { authService } from '@zylo/sdk-react';
 * await authService.signIn(email, password);
 *
 * // For custom endpoints, use authenticatedClient
 * import { authenticatedClient } from '@zylo/sdk-react';
 * const { data } = await authenticatedClient.get('/api/products');
 * ```
 */

// ============================================================
// Auth Service (Fixed Auth Endpoints)
// ============================================================

export {
  authService,
  configureAuth,
  AuthServiceError,
  getProjectIdFromToken,
  type AuthService,
} from './auth/index.js';

// ============================================================
// Authenticated Client (Dynamic Custom Endpoints)
// ============================================================

export {
  // Primary exports (preferred)
  AuthenticatedClient,
  authenticatedClient,
  clearTokenCache,
  type ApiResponse,
  type RequestOptions,
  // Backwards compatibility aliases
  ApiClient,
  apiClient,
} from './api/index.js';
