import { createClient, SupabaseClient, Session, User } from '@supabase/supabase-js';

// =============================================================================
// Configuration
// =============================================================================

// Use environment variables, fallback to placeholders
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder_anon_key';

// Only log if env variables are missing
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  console.warn('[Supabase] NEXT_PUBLIC_SUPABASE_URL is not set. Using placeholder URL. Auth will fail.');
}

if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  console.warn('[Supabase] NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Using placeholder anon key. Auth will fail.');
}

// =============================================================================
// Supabase Client
// =============================================================================

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// =============================================================================
// Session Management
// =============================================================================

export async function setSupabaseSession(
  accessToken: string,
  refreshToken: string
): Promise<{ user: User | null; error: Error | null }> {
  console.log('[Supabase] setSupabaseSession called');

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('[Supabase] Cannot set session - Supabase not configured!');
    return { user: null, error: new Error('Supabase not configured') };
  }

  try {
    const { data, error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
    if (error) return { user: null, error };
    return { user: data.user, error: null };
  } catch (err) {
    return { user: null, error: err instanceof Error ? err : new Error('Unknown error') };
  }
}

export async function getSupabaseSession(): Promise<Session | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}

export async function getAccessToken(): Promise<string | null> {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export async function clearSupabaseSession(): Promise<void> {
  await supabase.auth.signOut();
  console.log('[Supabase] Session cleared');
}

export function onAuthStateChange(callback: (event: string, session: Session | null) => void) {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(callback);
  return { unsubscribe: () => subscription.unsubscribe() };
}

// =============================================================================
// ProjectId Validation
// =============================================================================

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = atob(base64);
    return JSON.parse(payload);
  } catch {
    return null;
  }
}

export function getProjectIdFromToken(accessToken: string): string | null {
  const payload = decodeJwtPayload(accessToken);
  if (!payload) return null;
  const appMetadata = payload.app_metadata as Record<string, unknown> | undefined;
  return typeof appMetadata?.project_id === 'string' ? appMetadata.project_id : null;
}

export function validateProjectId(accessToken: string): boolean {
  const expectedProjectId = process.env.NEXT_PUBLIC_PROJECT_ID;
  if (!expectedProjectId || expectedProjectId === 'dev') return true;
  const tokenProjectId = getProjectIdFromToken(accessToken);
  if (!tokenProjectId) return true;
  return tokenProjectId === expectedProjectId;
}
