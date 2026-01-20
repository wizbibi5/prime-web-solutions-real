/**
 * @zylo/sdk-react
 *
 * React SDK for Zylo projects. Provides hooks, components, providers,
 * and services for authentication and API communication.
 *
 * ## SDK Architecture
 *
 * ### Authentication Layer
 *
 * **authService** - Handles standard auth endpoints (signIn, signUp, signOut, etc.)
 * These endpoints are fixed and consistent across all Zylo applications.
 *
 * **Auth Hooks** - React hooks that wrap authService:
 * - useAuth() - Full auth context (user, session, isLoading, signIn, signOut, etc.)
 * - useUser() - Current user only
 * - useSession() - Current session only
 * - useSignIn(), useSignUp(), useSignOut() - Individual operations with error state
 *
 * ### API Communication Layer
 *
 * **authenticatedClient** - General-purpose HTTP client for ANY custom endpoint.
 * When agents add new protected routes to the backend, frontend services should
 * use authenticatedClient to automatically handle JWT token injection.
 *
 * Features:
 * - Automatic Bearer token injection from current session
 * - Token refresh when expired (5-minute buffer)
 * - Automatic retry on 401 with fresh token
 * - Support for public endpoints via { skipAuth: true }
 *
 * @example
 * ```typescript
 * // Auth operations use authService (via hooks or directly)
 * const { signIn, user, isLoading } = useAuth();
 * await signIn(email, password);
 *
 * // Custom endpoints use authenticatedClient
 * import { authenticatedClient } from '@zylo/sdk-react';
 *
 * // In a custom service file:
 * export const productService = {
 *   getAll: () => authenticatedClient.get('/api/products'),
 *   create: (data) => authenticatedClient.post('/api/products', data),
 * };
 * ```
 */

// Re-export types from shared
export type {
  // Auth types
  ZyloAppUser,
  ZyloAuthSession,
  SignUpRequest,
  SignUpResponse,
  SignInRequest,
  SignInResponse,
  AuthErrorResponse,
  AuthErrorCode,
  AUTH_ENDPOINTS,
  // Config types
  ZyloConfig,
  FeatureKey,
  FeatureConfig,
} from '@zylo/sdk-shared';

// ============================================================
// Providers
// ============================================================

export { ZyloProvider, useZyloConfig, useFeatureEnabled } from './providers/index.js';

// ============================================================
// Auth Hooks
// ============================================================

export {
  useAuth,
  useUser,
  useSession,
  useSignIn,
  useSignOut,
  useSignUp,
} from './hooks/index.js';

// ============================================================
// Example Components (Reference implementations for agents)
// ============================================================

export {
  AuthGuard,
  LayoutProtection,
  ProtectedRoute,
  ProtectedLayout, // backwards compatibility alias
  SignInForm,
  SignUpForm,
  UserProfile,
} from './components/index.js';

// ============================================================
// Services
// ============================================================

export {
  // Auth Service (fixed auth endpoints)
  authService,
  configureAuth,
  AuthServiceError,

  // Authenticated Client (dynamic custom endpoints) - Primary exports
  AuthenticatedClient,
  authenticatedClient,
  clearTokenCache,
  type ApiResponse,
  type RequestOptions,

  // Backwards compatibility aliases
  ApiClient,
  apiClient,
} from './services/index.js';
