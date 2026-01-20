'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { ProtectedRoute } from './protected-route';

/**
 * PUBLIC ROUTES - Routes that do NOT require authentication
 *
 * Add routes here to make them publicly accessible.
 * All other routes are protected by default.
 *
 * MATCHING RULES:
 * - Exact match: '/login' matches '/login'
 * - Prefix match: '/login' also matches '/login/reset', '/login/verify'
 * - Root path '/': only matches exactly '/' (no prefix matching)
 *
 * To add a public route:
 * 1. Add the path to this array
 * 2. The route and all sub-routes become public
 */
const PUBLIC_ROUTES = ['/', '/login', '/signup', '/forgot-password'];

/**
 * AUTHENTICATED HOME - Where to redirect authenticated users
 *
 * When an authenticated user visits a public route (like /login),
 * they will be redirected here instead.
 *
 * Change this to customize the post-login destination.
 */
const AUTHENTICATED_HOME = '/home';

interface LayoutProtectionProps {
  children: React.ReactNode;
}

/**
 * Layout Protection wrapper
 *
 * Provides automatic route protection based on authentication state.
 * Uses Supabase client directly via AuthContext for real-time auth updates.
 *
 * ## How It Works
 *
 * 1. AuthProvider initializes and checks for existing Supabase session
 * 2. Session's projectId is validated against NEXT_PUBLIC_PROJECT_ID
 * 3. LayoutProtection reads auth state from useAuth() hook
 * 4. Routes are protected or allowed based on PUBLIC_ROUTES config
 *
 * ## Auth State Sources
 *
 * The auth state comes from Supabase client which:
 * - Persists session in localStorage
 * - Auto-refreshes tokens before expiry
 * - Fires onAuthStateChange on login/logout
 *
 * ## Routing Logic
 *
 * | Auth State    | Route Type | Action                        |
 * |---------------|------------|-------------------------------|
 * | Loading       | Any        | Show loading spinner          |
 * | Not Auth      | Protected  | Redirect to /login            |
 * | Not Auth      | Public     | Render page                   |
 * | Authenticated | Protected  | Render page                   |
 * | Authenticated | Public     | Redirect to AUTHENTICATED_HOME|
 *
 * ## Multi-Tenant Security
 *
 * JWT tokens contain projectId in app_metadata.project_id.
 * This is validated against NEXT_PUBLIC_PROJECT_ID on:
 * - Initial session load
 * - Each sign in/up
 * - Auth state changes
 *
 * If projectId doesn't match, session is cleared and user is logged out.
 */
export function LayoutProtection({ children }: LayoutProtectionProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();

  // Check if current route is public
  const isPublicRoute = PUBLIC_ROUTES.some((route) => {
    return pathname === route || (route !== '/' && pathname.startsWith(`${route}/`));
  });

  // Redirect authenticated users away from public routes (login, signup)
  useEffect(() => {
    if (loading) return;

    // If authenticated and on a public auth route, redirect to home
    if (user && isPublicRoute && pathname !== '/') {
      console.log('[LayoutProtection] Authenticated user on public route, redirecting to:', AUTHENTICATED_HOME);
      router.push(AUTHENTICATED_HOME);
    }
  }, [user, loading, isPublicRoute, pathname, router]);

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  // If public route, render without protection
  if (isPublicRoute) {
    // But if authenticated on login/signup, show nothing (will redirect)
    if (user && pathname !== '/') {
      return null;
    }
    return <>{children}</>;
  }

  // Otherwise, wrap with ProtectedRoute
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
