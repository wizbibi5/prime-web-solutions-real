/**
 * Example Components - @zylo/sdk-react
 *
 * Ready-to-use React components for common patterns.
 * These are REFERENCE IMPLEMENTATIONS - agents use these as examples
 * when creating custom components for Zylo applications.
 *
 * These components are unstyled/minimally styled - users are expected to customize.
 */

'use client';

import React, { useState, FormEvent } from 'react';
import type { ZyloAppUser } from '@zylo/sdk-shared';
import { useAuth, useUser } from '../hooks/index.js';

// ============================================================
// AuthGuard
// ============================================================

interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * Protect routes/components that require authentication.
 *
 * EXAMPLE USAGE:
 * ```tsx
 * <AuthGuard fallback={<LoginPage />}>
 *   <Dashboard />
 * </AuthGuard>
 * ```
 *
 * AGENT IMPLEMENTATION NOTES:
 * - Wrap protected routes/pages with this component
 * - The fallback prop shows content when user is not authenticated
 * - The redirectTo prop can be used for client-side redirects
 */
export function AuthGuard({ children, fallback, redirectTo }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    if (redirectTo && typeof window !== 'undefined') {
      window.location.href = redirectTo;
      return null;
    }
    return fallback ? <>{fallback}</> : <div>Please sign in to continue.</div>;
  }

  return <>{children}</>;
}

// ============================================================
// SignInForm
// ============================================================

interface SignInFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
}

/**
 * Basic sign-in form component.
 * Unstyled - apply your own CSS via className.
 *
 * EXAMPLE USAGE:
 * ```tsx
 * <SignInForm
 *   onSuccess={() => router.push('/dashboard')}
 *   className="my-signin-form"
 * />
 * ```
 *
 * AGENT IMPLEMENTATION NOTES:
 * - This demonstrates the pattern for using useAuth hook
 * - Form handling with loading and error states
 * - Callbacks for success/error handling
 * - Agents should create custom styled versions for each app
 */
export function SignInForm({ onSuccess, onError, className }: SignInFormProps) {
  const { signIn, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await signIn(email, password);
      onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign in failed');
      setError(error.message);
      onError?.(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div>
        <label htmlFor="signin-email">Email</label>
        <input
          id="signin-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="signin-password">Password</label>
        <input
          id="signin-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {error && <div role="alert">{error}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}

// ============================================================
// SignUpForm
// ============================================================

interface SignUpFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  className?: string;
  requirePasswordConfirmation?: boolean;
}

/**
 * Basic sign-up form component.
 * Unstyled - apply your own CSS via className.
 *
 * AGENT IMPLEMENTATION NOTES:
 * - This demonstrates the pattern for using useAuth hook for signup
 * - Password confirmation validation
 * - Agents should create custom styled versions for each app
 */
export function SignUpForm({
  onSuccess,
  onError,
  className,
  requirePasswordConfirmation = true,
}: SignUpFormProps) {
  const { signUp, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (requirePasswordConfirmation && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await signUp(email, password);
      onSuccess?.();
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Sign up failed');
      setError(error.message);
      onError?.(error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div>
        <label htmlFor="signup-email">Email</label>
        <input
          id="signup-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="signup-password">Password</label>
        <input
          id="signup-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
          minLength={8}
        />
      </div>

      {requirePasswordConfirmation && (
        <div>
          <label htmlFor="signup-confirm-password">Confirm Password</label>
          <input
            id="signup-confirm-password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>
      )}

      {error && <div role="alert">{error}</div>}

      <button type="submit" disabled={isLoading}>
        {isLoading ? 'Creating account...' : 'Sign Up'}
      </button>
    </form>
  );
}

// ============================================================
// UserProfile
// ============================================================

interface UserProfileProps {
  user?: ZyloAppUser;
  showEmail?: boolean;
  showAvatar?: boolean;
  className?: string;
}

/**
 * Display user profile information.
 * Uses current user from context if not provided.
 *
 * AGENT IMPLEMENTATION NOTES:
 * - Demonstrates using useUser hook
 * - Can accept user prop or use context
 * - Agents should create custom styled versions for each app
 */
export function UserProfile({
  user: propUser,
  showEmail = true,
  showAvatar = true,
  className,
}: UserProfileProps) {
  const contextUser = useUser();
  const user = propUser ?? contextUser;

  if (!user) {
    return <div className={className}>Not signed in</div>;
  }

  return (
    <div className={className}>
      {showAvatar && user.photoURL && (
        <img
          src={user.photoURL}
          alt={user.displayName ?? 'User avatar'}
          style={{ width: 40, height: 40, borderRadius: '50%' }}
        />
      )}
      <div>
        <div>{user.displayName ?? 'User'}</div>
        {showEmail && <div>{user.email}</div>}
      </div>
    </div>
  );
}

// ============================================================
// ProtectedRoute
// ============================================================

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Component to show while checking auth state */
  loadingComponent?: React.ReactNode;
  /** Path to redirect to when not authenticated (default: '/login') */
  redirectTo?: string;
  /** Custom router push function (for Next.js router.push) */
  onRedirect?: (path: string) => void;
}

/**
 * Protected Route wrapper component.
 * Checks authentication and redirects if not authenticated.
 *
 * AGENT IMPLEMENTATION NOTES:
 * - Used internally by LayoutProtection
 * - Can also be used standalone for individual route protection
 * - Provides loading state while checking auth
 * - Handles redirect when not authenticated
 */
export function ProtectedRoute({
  children,
  loadingComponent,
  redirectTo = '/login',
  onRedirect,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading state while checking auth
  if (isLoading) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        Loading...
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    if (onRedirect) {
      onRedirect(redirectTo);
    } else if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
    return null;
  }

  return <>{children}</>;
}

// ============================================================
// LayoutProtection
// ============================================================

interface LayoutProtectionProps {
  children: React.ReactNode;
  /** Routes that should NOT be protected (public routes) */
  publicRoutes?: string[];
  /** Path to redirect to when not authenticated (default: '/login') */
  redirectTo?: string;
  /** Path to redirect authenticated users when on public routes like /login (default: '/home') */
  authenticatedRedirect?: string;
  /** Component to show while checking auth state */
  loadingComponent?: React.ReactNode;
  /** Custom router push function (for Next.js router.push) */
  onRedirect?: (path: string) => void;
  /** Hook to get current pathname (required for Next.js) */
  usePathname: () => string;
}

/**
 * Layout Protection wrapper - use at root layout level.
 * Automatically protects all routes EXCEPT those listed in publicRoutes.
 *
 * ROUTING PATTERN:
 * - Protected routes: if not authed → redirect to `redirectTo` (default: '/login')
 * - Public routes: if authed → redirect to `authenticatedRedirect` (default: '/home')
 * - Login/signup pages should redirect to '/' after success, letting this component handle routing
 *
 * This pattern provides:
 * - Secure by default (all routes protected unless exempted)
 * - Single source of truth for auth routing logic
 * - Freedom for login/signup to just redirect to '/' without knowing the app structure
 *
 * EXAMPLE USAGE (Next.js App Router):
 * ```tsx
 * // app/layout.tsx
 * 'use client';
 * import { usePathname } from 'next/navigation';
 * import { LayoutProtection } from '@zylo/sdk-react';
 *
 * const PUBLIC_ROUTES = ['/login', '/signup', '/forgot-password'];
 *
 * export default function RootLayout({ children }: { children: React.ReactNode }) {
 *   return (
 *     <html>
 *       <body>
 *         <ZyloProvider config={config}>
 *           <LayoutProtection
 *             publicRoutes={PUBLIC_ROUTES}
 *             usePathname={usePathname}
 *             redirectTo="/login"
 *             authenticatedRedirect="/home"
 *           >
 *             {children}
 *           </LayoutProtection>
 *         </ZyloProvider>
 *       </body>
 *     </html>
 *   );
 * }
 * ```
 *
 * LOGIN/SIGNUP PAGES:
 * After successful auth, redirect to '/':
 * ```tsx
 * await signIn(email, password);
 * router.push('/');  // LayoutProtection handles the rest
 * ```
 *
 * ROUTE MATCHING:
 * - Exact match: '/login' matches only '/login'
 * - Prefix match: '/login' also matches '/login/reset', '/login/verify'
 * - Root path '/': only matches exactly '/' (no prefix matching)
 *
 * AGENT IMPLEMENTATION NOTES:
 * - Place at root layout, wrapping all children
 * - Define public routes in a constant for easy maintenance
 * - usePathname must be passed in (Next.js hook can't be used directly in SDK)
 * - All routes protected by default - add to publicRoutes to exempt
 * - Login/signup should redirect to '/' - this component handles authed user routing
 */
export function LayoutProtection({
  children,
  publicRoutes = [],
  redirectTo = '/login',
  authenticatedRedirect = '/home',
  loadingComponent,
  onRedirect,
  usePathname,
}: LayoutProtectionProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();

  // Check if current route is public
  const isPublicRoute = publicRoutes.some((route) => {
    // Exact match for root path
    if (route === '/') {
      return pathname === '/';
    }
    // Exact match or prefix match for other routes
    return pathname === route || pathname.startsWith(`${route}/`);
  });

  // Show loading while checking auth state
  if (isLoading) {
    return loadingComponent ? (
      <>{loadingComponent}</>
    ) : (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        Loading...
      </div>
    );
  }

  // If on a public route (like /login) but user IS authenticated, redirect to authenticated home
  if (isPublicRoute && isAuthenticated && authenticatedRedirect) {
    if (onRedirect) {
      onRedirect(authenticatedRedirect);
    } else if (typeof window !== 'undefined') {
      window.location.href = authenticatedRedirect;
    }
    return null;
  }

  // If public route and not authenticated, render normally
  if (isPublicRoute) {
    return <>{children}</>;
  }

  // Otherwise, wrap with ProtectedRoute (handles redirect if not authenticated)
  return (
    <ProtectedRoute
      redirectTo={redirectTo}
      loadingComponent={loadingComponent}
      onRedirect={onRedirect}
    >
      {children}
    </ProtectedRoute>
  );
}

// Keep ProtectedLayout as alias for backwards compatibility
export { ProtectedRoute as ProtectedLayout };
