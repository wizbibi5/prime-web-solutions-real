'use client';

/**
 * Auth Context
 *
 * Provides authentication state using Supabase client.
 * Watches onAuthStateChange for real-time auth updates.
 * Validates projectId to ensure multi-tenant security.
 *
 * ## How It Works
 *
 * The AuthProvider wraps your app and provides auth state to all components:
 *
 * ```tsx
 * // In layout.tsx
 * <AuthProvider>
 *   <LayoutProtection>
 *     {children}
 *   </LayoutProtection>
 * </AuthProvider>
 * ```
 *
 * ## Auth State Management
 *
 * On mount, the provider:
 * 1. Calls supabase.auth.getSession() to check for existing session
 * 2. Validates the session's projectId against NEXT_PUBLIC_PROJECT_ID
 * 3. If valid, sets user/session state; if invalid, clears session
 * 4. Subscribes to onAuthStateChange for real-time updates
 *
 * ## Sign In/Up Flow
 *
 * When signIn() or signUp() is called:
 * 1. Calls backend API with credentials
 * 2. Backend returns JWT tokens from Edge Function
 * 3. Validates projectId in token before accepting
 * 4. Calls setSupabaseSession() to store in Supabase client
 * 5. Supabase fires onAuthStateChange, updating context state
 *
 * ## Session Persistence
 *
 * Once authenticated:
 * - Session is stored in localStorage by Supabase client
 * - Supabase automatically refreshes tokens before expiry
 * - Page reloads restore session from localStorage
 * - Sign out clears both local and server sessions
 *
 * ## Usage
 *
 * ```tsx
 * import { useAuth } from '@/lib/auth';
 *
 * function MyComponent() {
 *   const { user, loading, signIn, signOut } = useAuth();
 *
 *   if (loading) return <Loading />;
 *   if (!user) return <LoginPrompt />;
 *
 *   return <Dashboard user={user} />;
 * }
 * ```
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import {
  supabase,
  setSupabaseSession,
  clearSupabaseSession,
  validateProjectId,
  getProjectIdFromToken,
} from '@/lib/supabase';

// =============================================================================
// Types
// =============================================================================

export interface AuthUser {
  id: string;
  email: string | null;
  projectId: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// =============================================================================
// Provider
// =============================================================================

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Transform Supabase user to AuthUser with projectId
   */
  const transformUser = useCallback((supabaseUser: User | null, accessToken?: string): AuthUser | null => {
    if (!supabaseUser) return null;

    const projectId = accessToken ? getProjectIdFromToken(accessToken) : null;

    return {
      id: supabaseUser.id,
      email: supabaseUser.email ?? null,
      projectId,
    };
  }, []);

  /**
   * Handle session update with projectId validation
   */
  const handleSessionUpdate = useCallback((newSession: Session | null) => {
    if (!newSession) {
      setSession(null);
      setUser(null);
      return;
    }

    // Validate projectId
    if (!validateProjectId(newSession.access_token)) {
      console.warn('[AuthContext] Session rejected due to projectId mismatch');
      clearSupabaseSession();
      setSession(null);
      setUser(null);
      setError('Invalid project credentials');
      return;
    }

    setSession(newSession);
    setUser(transformUser(newSession.user, newSession.access_token));
    setError(null);
  }, [transformUser]);

  // Initialize auth state and subscribe to changes
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Get initial session
        const { data: { session: initialSession } } = await supabase.auth.getSession();

        if (mounted) {
          if (initialSession) {
            handleSessionUpdate(initialSession);
          }
          setLoading(false);
        }
      } catch (err) {
        console.error('[AuthContext] Failed to initialize auth:', err);
        if (mounted) {
          setLoading(false);
          setError('Failed to initialize authentication');
        }
      }
    };

    initializeAuth();

    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (mounted) {
        handleSessionUpdate(newSession);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [handleSessionUpdate]);

  /**
   * Sign in via Zylo backend API
   */
  const signIn = useCallback(async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/v1/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        const errorMsg = data.error?.message || data.message || 'Sign in failed';
        setError(errorMsg);
        setLoading(false);
        return { success: false, error: errorMsg };
      }

      // Set Supabase session with tokens from backend
      // Response structure: { success: true, data: { session: { accessToken, refreshToken, ... } } }
      const authSession = data.data?.session || data.session;
      console.log('[AuthContext] Auth session from response:', authSession ? 'found' : 'not found');

      if (authSession?.accessToken && authSession?.refreshToken) {
        // Validate projectId before setting session
        if (!validateProjectId(authSession.accessToken)) {
          setError('Invalid project credentials');
          setLoading(false);
          return { success: false, error: 'Invalid project credentials' };
        }

        console.log('[AuthContext] Setting Supabase session...');
        await setSupabaseSession(authSession.accessToken, authSession.refreshToken);
        console.log('[AuthContext] Supabase session set successfully');
      } else {
        console.warn('[AuthContext] No session tokens in response');
      }

      setLoading(false);
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error';
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  }, []);

  /**
   * Sign up via Zylo backend API
   */
  const signUp = useCallback(async (email: string, password: string) => {
    console.log('[AuthContext] signUp called with email:', email);
    setLoading(true);
    setError(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      console.log('[AuthContext] Backend URL:', backendUrl);
      console.log('[AuthContext] Fetching:', `${backendUrl}/api/v1/auth/signup`);

      const response = await fetch(`${backendUrl}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      console.log('[AuthContext] Response status:', response.status);
      const data = await response.json();
      console.log('[AuthContext] Signup response:', JSON.stringify(data, null, 2));

      if (!response.ok || !data.success) {
        const errorMsg = data.error?.message || data.message || 'Sign up failed';
        setError(errorMsg);
        setLoading(false);
        return { success: false, error: errorMsg };
      }

      // Set Supabase session with tokens from backend
      // Response structure: { success: true, data: { session: { accessToken, refreshToken, ... } } }
      const authSession = data.data?.session || data.session;
      console.log('[AuthContext] Auth session from response:', authSession ? 'found' : 'not found');

      if (authSession?.accessToken && authSession?.refreshToken) {
        // Validate projectId before setting session
        if (!validateProjectId(authSession.accessToken)) {
          setError('Invalid project credentials');
          setLoading(false);
          return { success: false, error: 'Invalid project credentials' };
        }

        console.log('[AuthContext] Setting Supabase session...');
        await setSupabaseSession(authSession.accessToken, authSession.refreshToken);
        console.log('[AuthContext] Supabase session set successfully');
      } else {
        console.warn('[AuthContext] No session tokens in response');
      }

      setLoading(false);
      return { success: true };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Network error';
      setError(errorMsg);
      setLoading(false);
      return { success: false, error: errorMsg };
    }
  }, []);

  /**
   * Sign out
   */
  const signOut = useCallback(async () => {
    setLoading(true);
    try {
      // Call backend to invalidate server session
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const accessToken = session?.access_token;

      if (accessToken) {
        await fetch(`${backendUrl}/api/v1/auth/signout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({ accessToken }),
        }).catch(() => {
          // Continue with local signout even if server call fails
          console.warn('[AuthContext] Server signout failed, continuing with local signout');
        });
      }

      await clearSupabaseSession();
      setUser(null);
      setSession(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [session]);

  /**
   * Refresh the session
   */
  const refreshSession = useCallback(async () => {
    const { data: { session: newSession }, error: refreshError } = await supabase.auth.refreshSession();

    if (refreshError) {
      console.error('[AuthContext] Failed to refresh session:', refreshError);
      return;
    }

    handleSessionUpdate(newSession);
  }, [handleSessionUpdate]);

  const value: AuthContextValue = {
    user,
    session,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    refreshSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// =============================================================================
// Hook
// =============================================================================

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
