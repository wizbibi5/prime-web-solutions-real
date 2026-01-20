/**
 * Auth Implementation Documentation
 *
 * This file documents how auth should be implemented in Zylo applications.
 * It serves as a reference for both developers and the Phoenix-4 agent system.
 */

export const AUTH_DOCS = {
  /**
   * Overview of the auth system
   */
  overview: `
# Zylo Auth System

Zylo uses Supabase Auth with per-project HMAC signing for secure multi-tenant authentication.

## Architecture

1. **Frontend SDK** (@zylo/sdk-react)
   - Provides React hooks and services for auth operations
   - Calls backend API endpoints (not Supabase directly)
   - Manages session state in React context

2. **Backend SDK** (@zylo/sdk)
   - Signs requests with HMAC-SHA256 using project_secret
   - Forwards signed requests to Supabase Edge Functions
   - Handles server-side session validation

3. **Supabase Edge Functions**
   - Verifies HMAC signatures
   - Creates users with project_id in app_metadata
   - Returns JWT tokens for authentication

## Security Model

- Each project has a unique project_secret
- All auth requests are HMAC-signed to prevent spoofing
- JWTs contain project_id in app_metadata for RLS
- Tokens are never exposed to the client directly from Supabase

## Environment Variables Summary

### Backend (.env)
\`\`\`
ZYLO_PROJECT_ID=<project-id>
ZYLO_PROJECT_SECRET=<from-firestore-secrets>
SUPABASE_URL=<supabase-project-url>
SUPABASE_ANON_KEY=<supabase-anon-key>
\`\`\`

### Frontend (.env.local)
\`\`\`
NEXT_PUBLIC_API_URL=<backend-api-url>
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
NEXT_PUBLIC_ZYLO_PROJECT_ID=<project-id>
\`\`\`
`,

  /**
   * Backend implementation guide
   */
  backendImplementation: `
# Backend Auth Implementation

## Required Environment Variables

\`\`\`
ZYLO_PROJECT_ID=<project-id>
ZYLO_PROJECT_SECRET=<from-firestore-secrets>
SUPABASE_URL=<supabase-project-url>
SUPABASE_ANON_KEY=<supabase-anon-key>
\`\`\`

- **ZYLO_PROJECT_ID**: The unique project identifier (injected by Phoenix-4 during deployment)
- **ZYLO_PROJECT_SECRET**: The HMAC signing secret (decrypted from Firestore by Phoenix-4)
- **SUPABASE_URL**: Your Supabase project URL
- **SUPABASE_ANON_KEY**: Your Supabase anon/public key

## Creating Auth Endpoints

Use the @zylo/sdk auth module to create API routes:

\`\`\`typescript
// app/api/auth/signup/route.ts (Next.js App Router)
import { authServer } from '@zylo/sdk';

export async function POST(request: Request) {
  const body = await request.json();
  const result = await authServer.signUp(body);
  return Response.json(result);
}
\`\`\`

## How HMAC Signing Works

1. Backend SDK reads ZYLO_PROJECT_SECRET from env
2. Creates payload with timestamp and request data
3. Signs with HMAC-SHA256
4. Sends signed request to Supabase Edge Function
5. Edge Function verifies signature before processing

## Public vs Protected Routes

### Public Routes (no auth required)
These routes use \`authServer\` to mint JWTs via Edge Function:
- \`/api/auth/signup\` - Create new user
- \`/api/auth/signin\` - Authenticate user
- \`/api/auth/reset-password\` - Request password reset

### Protected Routes (auth required)
All other API routes should use \`withAuth\` middleware:

\`\`\`typescript
// app/api/users/me/route.ts
import { withAuth } from '@zylo/sdk';

export const GET = withAuth(async (request, { zyloUser, projectId }) => {
  return Response.json({ user: zyloUser });
});
\`\`\`

## Protecting Routes with withAuth

The \`withAuth\` middleware:
1. Extracts JWT from Authorization header
2. Verifies JWT signature using Supabase client (LOCAL, no network call)
3. Extracts project_id from app_metadata claim
4. Compares to ZYLO_PROJECT_ID env var
5. Rejects if mismatch (prevents cross-project access)

\`\`\`typescript
import { withAuth } from '@zylo/sdk';

// Simple usage
export const GET = withAuth(async (request, { user, zyloUser, projectId, supabase }) => {
  // user: Supabase User object
  // zyloUser: Formatted ZyloAppUser
  // projectId: Verified project ID
  // supabase: Authenticated Supabase client

  return Response.json({ data: 'protected' });
});

// Custom unauthorized response
export const POST = withAuth(
  async (request, ctx) => {
    return Response.json({ success: true });
  },
  {
    onUnauthorized: (reason) => {
      return new Response(JSON.stringify({ error: reason }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }
);
\`\`\`

## Standalone Verification

For custom middleware or non-standard setups:

\`\`\`typescript
import { verifyAuth } from '@zylo/sdk';

export async function middleware(request: Request) {
  const token = request.headers.get('Authorization')?.slice(7);

  const result = await verifyAuth(token);

  if (!result.success) {
    return new Response('Unauthorized', { status: 401 });
  }

  // result.user, result.zyloUser, result.projectId available
}
\`\`\`

## JWT Security (Why This Works)

JWTs are cryptographically signed. The signature is computed as:

\`\`\`
signature = HMAC-SHA256(header + "." + payload, SECRET_KEY)
\`\`\`

If an attacker modifies ANY part of the payload (like project_id):
- The hash input changes
- Due to avalanche effect, output is completely different
- Signature no longer matches
- Supabase client rejects the token

The attacker cannot forge a new valid signature because they don't have Supabase's SECRET_KEY.
`,

  /**
   * Frontend implementation guide
   */
  frontendImplementation: `
# Frontend Auth Implementation

## Required Environment Variables

\`\`\`
NEXT_PUBLIC_API_URL=<backend-api-url>
NEXT_PUBLIC_SUPABASE_URL=<supabase-project-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
NEXT_PUBLIC_ZYLO_PROJECT_ID=<project-id>
\`\`\`

These should be set in your \`.env.local\` file (Next.js) or equivalent for your framework.

- **NEXT_PUBLIC_API_URL**: The URL where your backend API endpoints are hosted (e.g., \`http://localhost:3000\` for local dev, or your production URL)
- **NEXT_PUBLIC_SUPABASE_URL**: Your Supabase project URL
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Your Supabase anon/public key
- **NEXT_PUBLIC_ZYLO_PROJECT_ID**: The Zylo project ID for this application

## Setup

### Option 1: Environment Variables (Recommended)

Set \`NEXT_PUBLIC_API_URL\` in your \`.env.local\` file. The SDK will automatically use it.

### Option 2: Programmatic Configuration

\`\`\`tsx
import { configureAuth } from '@zylo/sdk-react';

// Call this early in your app initialization (e.g., _app.tsx or layout.tsx)
configureAuth({
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
});
\`\`\`

### Option 3: Window Config (for dynamic runtime config)

\`\`\`html
<script>
  window.__ZYLO_CONFIG__ = {
    apiUrl: 'https://api.myapp.com'
  };
</script>
\`\`\`

### Provider Setup

Wrap your app with ZyloProvider:

\`\`\`tsx
import { ZyloProvider } from '@zylo/sdk-react';
import config from './zylo.config.json';

function App() {
  return (
    <ZyloProvider config={config}>
      <YourApp />
    </ZyloProvider>
  );
}
\`\`\`

## Using Auth Hooks

\`\`\`tsx
import { useAuth, useSignIn, useSignUp } from '@zylo/sdk-react';

function LoginPage() {
  const { signIn, isLoading, error } = useSignIn();

  const handleSubmit = async (email: string, password: string) => {
    await signIn(email, password);
  };

  // ...
}
\`\`\`

## Using Auth Services Directly

For custom implementations:

\`\`\`tsx
import { authService } from '@zylo/sdk-react';

// Services call your backend API endpoints
const session = await authService.signIn(email, password);
\`\`\`

## Session Storage

The SDK automatically handles session storage:

- JWT is stored in \`localStorage\` under \`zylo_session\`
- Access token stored separately under \`zylo_access_token\`
- Refresh token stored under \`zylo_refresh_token\`
- Session expiration is checked automatically
- Auto-refresh occurs when session is within 5 minutes of expiry

## Protected Routes (Frontend)

Use \`ProtectedLayout\` for route-level protection:

\`\`\`tsx
// app/(protected)/layout.tsx
'use client';
import { ProtectedLayout } from '@zylo/sdk-react';
import { useRouter } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <ProtectedLayout
      loginPath="/login"
      onRedirect={(path) => router.push(path)}
      loadingComponent={<div>Loading...</div>}
    >
      {children}
    </ProtectedLayout>
  );
}
\`\`\`

Recommended folder structure:

\`\`\`
app/
  layout.tsx           # Root layout with ZyloProvider
  (public)/
    login/page.tsx     # Public login page
    signup/page.tsx    # Public signup page
  (protected)/
    layout.tsx         # ProtectedLayout wrapper
    dashboard/page.tsx # Protected page
    settings/page.tsx  # Protected page
\`\`\`

## Making Authenticated API Calls

The authService automatically attaches the JWT to API requests:

\`\`\`tsx
// The Authorization header is automatically added
const response = await fetch('/api/users/me', {
  headers: {
    Authorization: \`Bearer \${authService.getAccessToken()}\`,
  },
});
\`\`\`
`,

  /**
   * Supabase Edge Function deployment
   */
  edgeFunctionDeployment: `
# Deploying the Zylo Auth Edge Function

The @zylo/edge-function package provides a ready-to-deploy Supabase Edge Function.

## Installation

\`\`\`bash
npm install @zylo/edge-function
\`\`\`

## Deployment Steps

### 1. Copy the function to your Supabase project

\`\`\`bash
# From your project root
cp -r node_modules/@zylo/edge-function/supabase/functions/zylo-auth supabase/functions/
\`\`\`

### 2. Set environment variables in Supabase Dashboard

Go to: Supabase Dashboard → Edge Functions → zylo-auth → Secrets

Required secrets:
\`\`\`
ZYLO_PROJECT_SECRET=<your-hmac-secret>
\`\`\`

Note: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are automatically available.

### 3. Deploy

\`\`\`bash
supabase functions deploy zylo-auth
\`\`\`

## Supported Actions

| Action | Description |
|--------|-------------|
| signup | Create new user with project_id in app_metadata |
| signin | Authenticate user and return JWT |
| signout | Invalidate user session |
| refresh | Refresh access token |
| reset-password | Send password reset email |
| get-user | Get user by ID |
| get-user-by-email | Get user by email |
| verify | Verify JWT token |

## Request Format

All requests must be HMAC-signed:

\`\`\`json
{
  "action": "signup",
  "payload": {
    "email": "user@example.com",
    "password": "password123",
    "projectId": "project-id"
  },
  "signature": "<hmac-signature>",
  "timestamp": 1234567890123
}
\`\`\`

The signature format: \`HMAC-SHA256(timestamp + "." + JSON.stringify(payload), PROJECT_SECRET)\`

## Local Development

\`\`\`bash
# Create .env.local in the edge-function directory
echo "ZYLO_PROJECT_SECRET=your-test-secret" > .env.local

# Serve locally
supabase functions serve zylo-auth --env-file .env.local
\`\`\`
`,

  /**
   * Complete auth flow diagram
   */
  authFlowDiagram: `
# Complete Auth Flow

## Sign Up / Sign In Flow

\`\`\`
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│  Next.js    │────▶│   @zylo/sdk │────▶│ Edge Func   │
│             │     │  Frontend   │     │   Backend   │     │ (Supabase)  │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
      │                    │                   │                   │
      │ 1. Submit form     │                   │                   │
      │───────────────────▶│                   │                   │
      │                    │ 2. POST /api/auth │                   │
      │                    │───────────────────▶                   │
      │                    │                   │ 3. HMAC sign      │
      │                    │                   │───────────────────▶
      │                    │                   │                   │
      │                    │                   │ 4. Verify HMAC,   │
      │                    │                   │    create user,   │
      │                    │                   │    return JWT     │
      │                    │                   │◀───────────────────
      │                    │ 5. Return JWT     │                   │
      │                    │◀───────────────────                   │
      │ 6. Store in        │                   │                   │
      │    localStorage    │                   │                   │
      │◀───────────────────│                   │                   │
\`\`\`

## Protected API Call Flow

\`\`\`
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Browser   │────▶│  Next.js    │────▶│   @zylo/sdk │
│             │     │  Frontend   │     │  withAuth   │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                   │
      │ 1. API call with   │                   │
      │    Bearer token    │                   │
      │───────────────────▶│                   │
      │                    │ 2. Forward to API │
      │                    │───────────────────▶
      │                    │                   │
      │                    │ 3. withAuth:      │
      │                    │   - Verify JWT    │
      │                    │   - Check project │
      │                    │   - Call handler  │
      │                    │                   │
      │                    │ 4. Return data    │
      │                    │◀───────────────────
      │ 5. Display data    │                   │
      │◀───────────────────│                   │
\`\`\`

Key points:
- Frontend NEVER calls Edge Function directly
- Edge Function only used for JWT minting (signup/signin)
- Protected routes use LOCAL JWT verification (no network call)
- project_id in JWT app_metadata prevents cross-project access
`,
} as const;
