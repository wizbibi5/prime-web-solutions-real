# Zylo SDK Architecture

> Documentation for the Zylo SDK system used across frontend and backend templates.

---

## Table of Contents

1. [Overview](#overview)
2. [Design Philosophy](#design-philosophy)
3. [SDK Packages](#sdk-packages)
4. [Frontend SDK (@zylo/sdk-react)](#frontend-sdk-zylosdk-react)
5. [Backend SDK (@zylo/sdk)](#backend-sdk-zylosdk)
6. [Frontend ↔ Backend Contract](#frontend--backend-contract)
7. [Feature Enablement Flow](#feature-enablement-flow)
8. [Available Features](#available-features)
9. [Protocol Enforcement](#protocol-enforcement)
10. [User Freedom Zone](#user-freedom-zone)
11. [Update Strategy](#update-strategy)
12. [Agent Integration](#agent-integration)

---

## Overview

The Zylo SDK provides a unified interface for common backend functionality across user projects. It enables a "headless Wix" experience where an AI agent builds custom applications while leveraging pre-built, protocol-enforced features for common patterns like authentication, database access, file storage, and email.

### Key Principles

- **Freedom with guardrails** - Users can build anything, but common features use SDK patterns
- **Protocol enforcement** - SDK methods ensure security, consistency, and best practices
- **Provider abstraction** - Swap Supabase for Firebase without code changes
- **Updateable** - Publish new SDK version, all projects benefit
- **Feature-gated** - Only enabled features are available (no dead code)

---

## Design Philosophy

### Why SDK over Baked-In Code?

| Approach | Pros | Cons |
|----------|------|------|
| **Baked sleeper features** | Works offline, simple | Hard to update, bloated, dead code |
| **Runtime injection** | Easy updates | Complex, magic, hard to debug |
| **SDK packages** | Clean separation, updateable, type-safe | Requires package management |

We chose **SDK packages** because:

1. **Separation of concerns** - SDK is its own versioned package
2. **Easy updates** - `npm update @zylo/sdk-react` updates all features
3. **Type safety** - Full TypeScript support
4. **No dead code** - Only enabled features are installed
5. **Customizable** - Users can extend or override SDK behavior

---

## SDK Packages

```
@zylo/sdk-react          # Frontend SDK (React hooks, services, components)
@zylo/sdk                # Backend SDK (Express middleware, database, services)
@zylo/sdk-shared         # Shared types and utilities
```

### Package Registry

SDK packages are published to npm (or private registry) and installed at deploy time based on enabled features.

---

## Frontend SDK (@zylo/sdk-react)

### Package Structure

```
@zylo/sdk-react/
├── services/                    # API call layer
│   ├── auth.service.ts          # authService.login(), logout(), getUser()
│   ├── storage.service.ts       # storageService.upload(), getUrl()
│   ├── email.service.ts         # emailService.send()
│   └── index.ts
│
├── hooks/                       # React hooks (state + services)
│   ├── useAuth.ts               # { user, login, logout, isLoading, error }
│   ├── useUpload.ts             # { upload, progress, isUploading, error }
│   ├── useZyloForm.ts           # Form state with validation
│   ├── useQuery.ts              # Data fetching with caching
│   └── index.ts
│
├── components/                  # Pre-built UI components (optional)
│   ├── auth/
│   │   ├── LoginForm.tsx        # Ready-to-use login form
│   │   ├── SignupForm.tsx       # Ready-to-use signup form
│   │   ├── AuthGuard.tsx        # Route protection wrapper
│   │   └── UserMenu.tsx         # User avatar + dropdown
│   ├── forms/
│   │   ├── FormField.tsx        # Input with label, error, validation
│   │   ├── FormBuilder.tsx      # Dynamic form from schema
│   │   └── SubmitButton.tsx     # Loading state button
│   ├── storage/
│   │   ├── FileUploader.tsx     # Drag-drop file upload
│   │   ├── ImagePicker.tsx      # Image selection with preview
│   │   └── FileList.tsx         # Display uploaded files
│   └── index.ts
│
├── providers/                   # React context providers
│   ├── ZyloProvider.tsx         # Root provider (wraps all others)
│   ├── AuthProvider.tsx         # Auth state context
│   └── index.ts
│
├── utils/                       # Helper utilities
│   ├── api-client.ts            # Configured axios instance
│   └── validation.ts            # Common validation schemas
│
├── types/                       # TypeScript types
│   ├── auth.types.ts
│   ├── storage.types.ts
│   └── index.ts
│
└── index.ts                     # Main exports
```

### Usage Examples

#### Setup (in app layout)

```tsx
// app/layout.tsx
import { ZyloProvider } from '@zylo/sdk-react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <ZyloProvider>
          {children}
        </ZyloProvider>
      </body>
    </html>
  );
}
```

#### Using Hooks

```tsx
// Using the auth hook
import { useAuth } from '@zylo/sdk-react';

function ProfilePage() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (!user) return <Redirect to="/login" />;

  return (
    <div>
      <h1>Welcome, {user.email}</h1>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

#### Using Pre-built Components

```tsx
// Using SDK components (optional - for rapid development)
import { LoginForm, AuthGuard } from '@zylo/sdk-react/components';

function LoginPage() {
  return (
    <LoginForm
      onSuccess={() => router.push('/dashboard')}
      onError={(err) => toast.error(err.message)}
    />
  );
}

function ProtectedPage() {
  return (
    <AuthGuard fallback={<LoginPage />}>
      <Dashboard />
    </AuthGuard>
  );
}
```

#### Building Custom UI with Hooks

```tsx
// Custom login form using hooks (full control)
import { useAuth } from '@zylo/sdk-react';
import { Button, Input } from '@/components/ui';

function CustomLoginForm() {
  const { login, isLoading, error } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await login(email, password);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input value={email} onChange={setEmail} placeholder="Email" />
      <Input value={password} onChange={setPassword} type="password" />
      {error && <p className="text-red-500">{error.message}</p>}
      <Button loading={isLoading}>Login</Button>
    </form>
  );
}
```

---

## Backend SDK (@zylo/sdk)

### Package Structure

```
@zylo/sdk/
├── core/                        # Core SDK functionality
│   ├── ZyloSDK.ts               # Main SDK class
│   ├── config.ts                # Configuration loader
│   └── index.ts
│
├── auth/                        # Authentication module
│   ├── middleware.ts            # zylo.auth.middleware()
│   ├── routes.ts                # Auto-registered auth routes
│   ├── providers/
│   │   ├── supabase.ts          # Supabase auth provider
│   │   └── firebase.ts          # Firebase auth provider
│   └── index.ts
│
├── database/                    # Database module
│   ├── client.ts                # zylo.db.from().select()
│   ├── query-builder.ts         # Chainable query builder
│   ├── providers/
│   │   ├── supabase.ts          # Supabase database
│   │   └── prisma.ts            # Prisma adapter
│   └── index.ts
│
├── storage/                     # File storage module
│   ├── client.ts                # zylo.storage.upload()
│   ├── routes.ts                # Upload endpoints
│   ├── providers/
│   │   ├── supabase.ts          # Supabase storage
│   │   └── s3.ts                # S3-compatible storage
│   └── index.ts
│
├── email/                       # Email module
│   ├── client.ts                # zylo.email.send()
│   ├── providers/
│   │   ├── resend.ts            # Resend provider
│   │   └── sendgrid.ts          # SendGrid provider
│   └── index.ts
│
├── types/                       # TypeScript types
│   └── index.ts
│
└── index.ts                     # Main exports
```

### Usage Examples

#### Setup (in server.ts)

```typescript
// server.ts
import express from 'express';
import { ZyloSDK } from '@zylo/sdk';

const app = express();
const zylo = new ZyloSDK();

// Initialize SDK (reads zylo.config.json, sets up enabled features)
await zylo.initialize(app);

// SDK auto-registers routes for enabled features:
// POST /zylo/auth/login
// POST /zylo/auth/signup
// GET  /zylo/auth/me
// POST /zylo/storage/upload
// etc.

app.listen(process.env.PORT);
```

#### Using Auth Middleware

```typescript
import { zylo } from './zylo';

// Protect routes
router.get('/api/v1/profile',
  zylo.auth.middleware(),  // Requires authentication
  async (req, res) => {
    // req.user is guaranteed to exist
    res.json({ user: req.user });
  }
);

// Optional auth
router.get('/api/v1/posts',
  zylo.auth.optionalMiddleware(),  // Attaches user if present
  async (req, res) => {
    const posts = await getPosts(req.user?.id);
    res.json({ posts });
  }
);
```

#### Using Database

```typescript
import { zylo } from './zylo';

// Query builder
const users = await zylo.db
  .from('users')
  .select('id', 'email', 'name')
  .where({ active: true })
  .orderBy('created_at', 'desc')
  .limit(10);

// Insert
const newUser = await zylo.db
  .from('users')
  .insert({ email: 'user@example.com', name: 'John' })
  .returning('*');

// Transaction
await zylo.db.transaction(async (tx) => {
  const user = await tx.from('users').insert({ email }).returning('*');
  await tx.from('profiles').insert({ user_id: user.id });
});
```

#### Using Storage

```typescript
import { zylo } from './zylo';

// Upload file
const { url, path } = await zylo.storage.upload({
  bucket: 'avatars',
  path: `users/${userId}/avatar.png`,
  data: buffer,
  contentType: 'image/png',
});

// Get public URL
const publicUrl = zylo.storage.getPublicUrl({
  bucket: 'avatars',
  path: 'users/123/avatar.png',
});
```

---

## Frontend ↔ Backend Contract

The SDK enforces a consistent API contract between frontend and backend.

### Auth Endpoints

| Frontend Service | Backend Endpoint | Description |
|-----------------|------------------|-------------|
| `authService.login(email, password)` | `POST /zylo/auth/login` | User login |
| `authService.signup(email, password)` | `POST /zylo/auth/signup` | User registration |
| `authService.logout()` | `POST /zylo/auth/logout` | User logout |
| `authService.getUser()` | `GET /zylo/auth/me` | Get current user |
| `authService.refreshToken()` | `POST /zylo/auth/refresh` | Refresh JWT |

### Storage Endpoints

| Frontend Service | Backend Endpoint | Description |
|-----------------|------------------|-------------|
| `storageService.upload(file)` | `POST /zylo/storage/upload` | Upload file |
| `storageService.delete(path)` | `DELETE /zylo/storage/:path` | Delete file |
| `storageService.getUrl(path)` | `GET /zylo/storage/url/:path` | Get signed URL |

### Response Format

All SDK endpoints return a consistent response format:

```typescript
// Success
{
  success: true,
  data: { ... },
  message?: string
}

// Error
{
  success: false,
  error: {
    message: string,
    code?: string,
    details?: any
  }
}
```

---

## Feature Enablement Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FEATURE ENABLEMENT FLOW                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  1. User clicks "Enable Auth" in Zylo Dashboard                             │
│                          ↓                                                   │
│  2. Dashboard updates Firestore:                                            │
│     projects/{projectId}/config.features.auth = { enabled: true }           │
│                          ↓                                                   │
│  3. Dashboard commits zylo.config.json to user's repo:                      │
│     {                                                                        │
│       "features": {                                                          │
│         "auth": { "enabled": true, "provider": "supabase" }                 │
│       }                                                                      │
│     }                                                                        │
│                          ↓                                                   │
│  4. On next deploy, Runner reads zylo.config.json                           │
│                          ↓                                                   │
│  5. Runner installs required packages:                                       │
│     npm install @zylo/sdk @zylo/sdk-react                                   │
│                          ↓                                                   │
│  6. Backend SDK auto-registers /zylo/auth/* routes                          │
│                          ↓                                                   │
│  7. Frontend SDK provides useAuth() hook                                     │
│                          ↓                                                   │
│  8. Agent builds UI using SDK hooks and components                          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### zylo.config.json

This file lives in the project root and defines enabled features:

```json
{
  "projectId": "abc123",
  "version": "1.0.0",
  "features": {
    "auth": {
      "enabled": true,
      "provider": "supabase",
      "config": {
        "requireEmailVerification": false,
        "allowSocialLogin": true,
        "socialProviders": ["google", "github"]
      }
    },
    "database": {
      "enabled": true,
      "provider": "supabase"
    },
    "storage": {
      "enabled": false
    },
    "email": {
      "enabled": false
    }
  }
}
```

---

## Available Features

### Auth

| Capability | Frontend | Backend |
|------------|----------|---------|
| Login/Signup | `useAuth()`, `<LoginForm />` | `/zylo/auth/*` routes |
| Session management | Auto token refresh | JWT middleware |
| Social login | `useSocialLogin()` | OAuth handlers |
| Password reset | `usePasswordReset()` | Email + token flow |
| Route protection | `<AuthGuard />` | `zylo.auth.middleware()` |

### Database

| Capability | Frontend | Backend |
|------------|----------|---------|
| CRUD operations | Via API calls | `zylo.db.from().*` |
| Transactions | N/A | `zylo.db.transaction()` |
| Raw SQL | N/A | `zylo.db.raw()` |
| Type safety | Shared types | Full TypeScript |

### Storage

| Capability | Frontend | Backend |
|------------|----------|---------|
| File upload | `useUpload()`, `<FileUploader />` | `zylo.storage.upload()` |
| Image handling | `<ImagePicker />` | Auto-resize, thumbnails |
| Public URLs | `getPublicUrl()` | Signed URLs |
| Bucket management | N/A | `zylo.storage.bucket()` |

### Email

| Capability | Frontend | Backend |
|------------|----------|---------|
| Send email | Via API | `zylo.email.send()` |
| Templates | N/A | `zylo.email.template()` |
| Providers | N/A | Resend, SendGrid |

---

## Protocol Enforcement

The SDK enforces best practices and security patterns.

### What MUST Use SDK

```typescript
// ✅ CORRECT - Use SDK
const { user } = await zylo.auth.verifyToken(token);
const users = await zylo.db.from('users').select('*');
await zylo.storage.upload({ bucket, path, data });

// ❌ WRONG - Bypass SDK
import { createClient } from '@supabase/supabase-js';
const supabase = createClient(url, key);  // Direct access
```

### Why Enforce Protocol

1. **Security** - SDK handles credential management, no hardcoded secrets
2. **Consistency** - Standardized response formats, error handling
3. **Abstraction** - Switch providers without code changes
4. **Audit logging** - SDK can log all operations
5. **Rate limiting** - SDK can enforce limits
6. **Updates** - Security patches apply to all projects

### Enforcement in Agent

The Phoenix agent's prompt builder includes SDK documentation that:

1. Shows correct SDK usage patterns
2. Shows anti-patterns to avoid
3. Only includes docs for enabled features
4. Explains WHY protocol matters

---

## User Freedom Zone

The SDK provides a foundation, but users have complete freedom for:

### Components

```
- Build any component using Radix UI / shadcn
- No SDK components required
- SDK components are just conveniences
```

### Business Logic

```
- Custom API endpoints alongside SDK routes
- Custom database queries
- Custom validation logic
- Any npm package
```

### Styling

```
- Full Tailwind CSS control
- Custom themes
- Any CSS approach
```

### Pages/Routes

```
- Any Next.js routing structure
- Custom layouts
- Dynamic routes
```

### Example: SDK + Custom Code

```typescript
// Mix SDK with custom code
import { zylo } from '@/zylo';
import { customBusinessLogic } from '@/lib/custom';

router.post('/api/v1/orders',
  zylo.auth.middleware(),  // SDK auth
  async (req, res) => {
    const user = req.user;  // From SDK

    // Custom business logic (user's code)
    const order = await customBusinessLogic.createOrder({
      userId: user.id,
      items: req.body.items,
    });

    // SDK database
    await zylo.db.from('orders').insert(order);

    // SDK email
    await zylo.email.send({
      to: user.email,
      template: 'order-confirmation',
      data: { order },
    });

    res.json({ success: true, data: order });
  }
);
```

---

## Update Strategy

### Publishing Updates

```bash
# Update SDK packages
npm publish @zylo/sdk@1.1.0
npm publish @zylo/sdk-react@1.1.0
```

### User Updates

**Option A: Auto-update (recommended)**
- On each deploy, runner runs `npm update @zylo/sdk*`
- User always has latest SDK

**Option B: Pinned versions**
- User can pin version in package.json
- Manual update via dashboard

### Breaking Changes

1. Semver for SDK packages
2. Major versions require user opt-in
3. Migration guides in docs
4. Deprecation warnings before removal

---

## Agent Integration

The Phoenix agent (AI) uses the SDK by:

### 1. Prompt Context

The agent receives SDK documentation in its system prompt, including:

- Available features for this project
- Correct usage patterns
- Anti-patterns to avoid
- When to use SDK vs custom code

### 2. Dynamic Context

Only enabled features are included in the prompt:

```typescript
// In promptBuilder.ts
if (config.features.auth?.enabled) {
  sections.push(getAuthSdkDocs());
}
if (config.features.database?.enabled) {
  sections.push(getDatabaseSdkDocs());
}
// Only enabled features → no context bloat
```

### 3. Agent Behavior

The agent:
- Uses SDK methods for enabled features
- Builds custom components freely
- Never hardcodes credentials
- Never bypasses SDK for enabled features
- Can suggest enabling features if needed

---

## Next Steps

1. **Create SDK packages** - Set up `@zylo/sdk` and `@zylo/sdk-react`
2. **Implement auth feature** - First feature to validate architecture
3. **Update templates** - Add SDK integration to boilerplates
4. **Agent prompts** - Add SDK context to Phoenix agent
5. **Dashboard UI** - Feature enablement interface

---

## Appendix: Package Dependencies

### Frontend (@zylo/sdk-react)

```json
{
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "next": "^14.0.0 || ^15.0.0"
  },
  "dependencies": {
    "@zylo/sdk-shared": "^1.0.0",
    "axios": "^1.6.0",
    "zod": "^3.22.0"
  }
}
```

### Backend (@zylo/sdk)

```json
{
  "peerDependencies": {
    "express": "^4.18.0 || ^5.0.0"
  },
  "dependencies": {
    "@zylo/sdk-shared": "^1.0.0",
    "@supabase/supabase-js": "^2.38.0"
  }
}
```
