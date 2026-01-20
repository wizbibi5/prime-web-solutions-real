/**
 * Providers - @zylo/sdk-react
 *
 * React context providers for Zylo SDK configuration and state.
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import type { ZyloConfig, FeatureKey, ZyloAppUser, ZyloAuthSession } from '@zylo/sdk-shared';
import { authService, getProjectIdFromToken } from '../services/index.js';

// ============================================================
// Config Context
// ============================================================

interface ZyloContextValue {
  config: ZyloConfig;
  isFeatureEnabled: (feature: FeatureKey) => boolean;
}

const ZyloConfigContext = createContext<ZyloContextValue | null>(null);

// ============================================================
// Auth Context
// ============================================================

export interface AuthContextValue {
  user: ZyloAppUser | null;
  session: ZyloAuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ============================================================
// ZyloProvider
// ============================================================

interface ZyloProviderProps {
  config: ZyloConfig;
  children: React.ReactNode;
}

/**
 * Root provider for Zylo SDK.
 * Wrap your app with this provider to enable SDK functionality.
 *
 * @example
 * ```tsx
 * import { ZyloProvider } from '@zylo/sdk-react';
 * import config from './zylo.config.json';
 *
 * function App() {
 *   return (
 *     <ZyloProvider config={config}>
 *       <YourApp />
 *     </ZyloProvider>
 *   );
 * }
 * ```
 */
export function ZyloProvider({ config, children }: ZyloProviderProps) {
  const [user, setUser] = useState<ZyloAppUser | null>(null);
  const [session, setSession] = useState<ZyloAuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  /**
   * Validate that a session belongs to the expected project.
   * Returns true if valid, false if projectId doesn't match.
   */
  const validateSessionProject = useCallback((sessionToValidate: ZyloAuthSession): boolean => {
    // If no projectId configured, skip validation (development mode)
    if (!config.projectId || config.projectId === 'dev') {
      return true;
    }

    const tokenProjectId = getProjectIdFromToken(sessionToValidate.accessToken);
    if (!tokenProjectId) {
      console.warn('[Zylo SDK] Could not extract projectId from JWT');
      return true; // Allow if we can't validate (backwards compatibility)
    }

    if (tokenProjectId !== config.projectId) {
      console.warn(
        `[Zylo SDK] Session projectId mismatch. Expected: ${config.projectId}, Got: ${tokenProjectId}`
      );
      return false;
    }

    return true;
  }, [config.projectId]);

  // Initialize auth state on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const currentSession = await authService.getSession();
        if (currentSession) {
          // Validate projectId before accepting session
          if (validateSessionProject(currentSession)) {
            setSession(currentSession);
            setUser(currentSession.user);
          } else {
            // Clear invalid session
            console.warn('[Zylo SDK] Clearing session due to projectId mismatch');
            await authService.signOut();
          }
        }
      } catch (error) {
        console.error('[Zylo SDK] Failed to initialize auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (config.features.auth?.enabled) {
      initAuth();
    } else {
      setIsLoading(false);
    }
  }, [config.features.auth?.enabled, validateSessionProject]);

  // Config context value
  const configValue = useMemo<ZyloContextValue>(() => ({
    config,
    isFeatureEnabled: (feature: FeatureKey) => config.features[feature]?.enabled ?? false,
  }), [config]);

  // Auth methods
  const signIn = useCallback(async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const newSession = await authService.signIn(email, password);

      // Validate projectId before accepting session
      if (!validateSessionProject(newSession)) {
        await authService.signOut();
        throw new Error('Authentication failed: Invalid project credentials');
      }

      setSession(newSession);
      setUser(newSession.user);
    } finally {
      setIsLoading(false);
    }
  }, [validateSessionProject]);

  const signUp = useCallback(async (email: string, password: string, metadata?: Record<string, unknown>) => {
    setIsLoading(true);
    try {
      const newSession = await authService.signUp(email, password, { metadata });

      // Validate projectId before accepting session
      if (!validateSessionProject(newSession)) {
        await authService.signOut();
        throw new Error('Registration failed: Invalid project credentials');
      }

      setSession(newSession);
      setUser(newSession.user);
    } finally {
      setIsLoading(false);
    }
  }, [validateSessionProject]);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.signOut();
      setSession(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSession = useCallback(async () => {
    const newSession = await authService.refreshSession();
    if (newSession) {
      setSession(newSession);
      setUser(newSession.user);
    } else {
      setSession(null);
      setUser(null);
    }
  }, []);

  // Auth context value
  const authValue = useMemo<AuthContextValue>(() => ({
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
    refreshSession,
  }), [user, session, isLoading, signIn, signUp, signOut, refreshSession]);

  return (
    <ZyloConfigContext.Provider value={configValue}>
      <AuthContext.Provider value={authValue}>
        {children}
      </AuthContext.Provider>
    </ZyloConfigContext.Provider>
  );
}

// ============================================================
// Hooks
// ============================================================

/**
 * Access the Zylo configuration.
 */
export function useZyloConfig(): ZyloContextValue {
  const context = useContext(ZyloConfigContext);
  if (!context) {
    throw new Error('useZyloConfig must be used within a ZyloProvider');
  }
  return context;
}

/**
 * Check if a feature is enabled.
 */
export function useFeatureEnabled(feature: FeatureKey): boolean {
  const { isFeatureEnabled } = useZyloConfig();
  return isFeatureEnabled(feature);
}

/**
 * Access auth context (internal use).
 */
export function useAuthContext(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within a ZyloProvider');
  }
  return context;
}
