/**
 * Hooks - @zylo/sdk-react
 *
 * React hooks for auth operations.
 */

'use client';

import { useState, useCallback } from 'react';
import type { ZyloAppUser, ZyloAuthSession } from '@zylo/sdk-shared';
import { useAuthContext } from '../providers/index.js';

// ============================================================
// Auth Hooks
// ============================================================

/**
 * Hook for authentication operations.
 *
 * @example
 * ```tsx
 * function LoginPage() {
 *   const { signIn, isLoading, error } = useAuth();
 *
 *   const handleSubmit = async (e) => {
 *     e.preventDefault();
 *     await signIn(email, password);
 *   };
 * }
 * ```
 */
export function useAuth() {
  const context = useAuthContext();
  return context;
}

/**
 * Get the current user.
 */
export function useUser(): ZyloAppUser | null {
  const { user } = useAuthContext();
  return user;
}

/**
 * Get the current session.
 */
export function useSession(): ZyloAuthSession | null {
  const { session } = useAuthContext();
  return session;
}

/**
 * Hook for sign in operations.
 */
export function useSignIn() {
  const { signIn, isLoading } = useAuthContext();
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (email: string, password: string) => {
    setError(null);
    try {
      await signIn(email, password);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sign in failed'));
      throw err;
    }
  }, [signIn]);

  return { signIn: execute, isLoading, error };
}

/**
 * Hook for sign up operations.
 */
export function useSignUp() {
  const { signUp, isLoading } = useAuthContext();
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (
    email: string,
    password: string,
    metadata?: Record<string, unknown>
  ) => {
    setError(null);
    try {
      await signUp(email, password, metadata);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sign up failed'));
      throw err;
    }
  }, [signUp]);

  return { signUp: execute, isLoading, error };
}

/**
 * Hook for sign out operations.
 */
export function useSignOut() {
  const { signOut, isLoading } = useAuthContext();
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    setError(null);
    try {
      await signOut();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Sign out failed'));
      throw err;
    }
  }, [signOut]);

  return { signOut: execute, isLoading, error };
}
