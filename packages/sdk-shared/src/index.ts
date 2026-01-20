/**
 * @zylo/sdk-shared
 *
 * Shared types, interfaces, and utilities used by both
 * @zylo/sdk (backend) and @zylo/sdk-react (frontend)
 *
 * ============================================================
 * ZYLO SDK ARCHITECTURE
 * ============================================================
 *
 * The Zylo SDK is split into three packages that work together:
 *
 * ## @zylo/sdk-shared (this package)
 * Shared types and contracts used by both frontend and backend.
 * - Auth types (ZyloAppUser, ZyloAuthSession, request/response types)
 * - API endpoint constants (AUTH_ENDPOINTS)
 * - Error classes (ZyloError, AuthError, ValidationError)
 * - Feature configuration types
 *
 * ## @zylo/sdk (backend)
 * Backend SDK for Node.js/Express applications.
 * - Auth module: signUp, signIn, verifySession, refreshToken
 * - Auth middleware: requireAuth, optionalAuth for protecting routes
 * - Communicates with Supabase Edge Functions via HMAC-signed requests
 *
 * ## @zylo/sdk-react (frontend)
 * React SDK for Next.js/React applications.
 *
 * ### Two-Layer API Communication:
 *
 * **1. authService (Fixed Auth Endpoints)**
 * Handles standard authentication that's consistent across all Zylo apps:
 * - signUp, signIn, signOut, refreshSession, sendPasswordResetEmail
 * - Calls fixed endpoints: /auth/signup, /auth/signin, /auth/refresh, etc.
 * - These endpoints are built into every Zylo backend boilerplate
 *
 * **2. authenticatedClient (Dynamic Custom Endpoints)**
 * General-purpose HTTP client for ANY custom endpoint users add.
 * When agents create new protected routes in the backend, they use
 * authenticatedClient in frontend services to:
 * - Automatically inject JWT Bearer token from session
 * - Refresh expired tokens before request (5-minute buffer)
 * - Retry on 401 with fresh token
 * - Support public endpoints via { skipAuth: true }
 *
 * ### Usage Pattern for Agents:
 *
 * When adding a new feature with protected API endpoints:
 *
 * 1. Backend: Create routes with requireAuth middleware
 *    ```typescript
 *    // backend: routes/products.ts
 *    import { requireAuth } from '@zylo/sdk';
 *
 *    router.get('/api/products', requireAuth, async (req, res) => {
 *      // req.user is available from middleware
 *    });
 *    ```
 *
 * 2. Frontend: Create service using authenticatedClient
 *    ```typescript
 *    // frontend: services/productService.ts
 *    import { authenticatedClient } from '@zylo/sdk-react';
 *
 *    export const productService = {
 *      getAll: () => authenticatedClient.get('/api/products'),
 *      create: (data) => authenticatedClient.post('/api/products', data),
 *    };
 *    ```
 *
 * 3. Frontend: Use in components via hooks or directly
 *    ```typescript
 *    const { data } = await productService.getAll();
 *    ```
 *
 * ============================================================
 */

// ============================================================
// Contracts (API boundaries)
// ============================================================

export * from './contracts/index.js';

// ============================================================
// Feature Configuration Types
// ============================================================

export type FeatureKey = 'auth' | 'database' | 'storage' | 'email' | 'payments';

export interface FeatureConfig {
  enabled: boolean;
  provider?: string;
  settings?: Record<string, unknown>;
}

export interface ZyloConfig {
  projectId: string;
  features: Partial<Record<FeatureKey, FeatureConfig>>;
  environment: 'development' | 'staging' | 'production';
}

// ============================================================
// Auth Types
// ============================================================

export interface ZyloUser {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface AuthSession {
  user: ZyloUser;
  accessToken: string;
  refreshToken?: string;
  expiresAt: Date;
}

export interface AuthProvider {
  id: string;
  name: string;
  type: 'oauth' | 'email' | 'phone' | 'magic-link';
}

// ============================================================
// Database Types
// ============================================================

export interface QueryOptions {
  select?: string[];
  where?: Record<string, unknown>;
  orderBy?: { column: string; direction: 'asc' | 'desc' }[];
  limit?: number;
  offset?: number;
}

export interface QueryResult<T> {
  data: T[];
  count: number;
  error?: string;
}

// ============================================================
// Storage Types
// ============================================================

export interface StorageFile {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  url: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}

export interface UploadOptions {
  bucket?: string;
  path?: string;
  contentType?: string;
  metadata?: Record<string, unknown>;
  public?: boolean;
}

export interface UploadResult {
  file: StorageFile;
  error?: string;
}

// ============================================================
// Email Types
// ============================================================

export interface EmailRecipient {
  email: string;
  name?: string;
}

export interface EmailMessage {
  to: EmailRecipient | EmailRecipient[];
  cc?: EmailRecipient | EmailRecipient[];
  bcc?: EmailRecipient | EmailRecipient[];
  subject: string;
  text?: string;
  html?: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
}

export interface EmailResult {
  messageId: string;
  success: boolean;
  error?: string;
}

// ============================================================
// API Response Types
// ============================================================

export interface ZyloApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// ============================================================
// Error Types
// ============================================================

export class ZyloError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'ZyloError';
  }
}

export class AuthError extends ZyloError {
  constructor(message: string, code: string = 'AUTH_ERROR', details?: Record<string, unknown>) {
    super(message, code, 401, details);
    this.name = 'AuthError';
  }
}

export class ValidationError extends ZyloError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'VALIDATION_ERROR', 400, details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends ZyloError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'NOT_FOUND', 404, details);
    this.name = 'NotFoundError';
  }
}

// ============================================================
// Utility Types
// ============================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type AsyncResult<T, E = Error> = Promise<{ data: T; error: null } | { data: null; error: E }>;
