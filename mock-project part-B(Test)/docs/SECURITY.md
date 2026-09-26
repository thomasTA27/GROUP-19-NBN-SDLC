# Security

## Overview

Security is enforced in layers — each layer is independent so a failure in one does not collapse the others.

| Layer | Mechanism |
|-------|-----------|
| Claude Code | Deny rules, PreToolUse/PostToolUse hooks |
| HTTP | helmet headers, CORS policy, rate limiting, body size cap |
| Auth | Firebase token verification, session cookies |
| API | Zod input validation, per-user access control |
| Data | Firestore security rules (default deny, field allowlists) |
| CI | `pnpm audit --audit-level=high` on every PR |
| Dependencies | Dependabot weekly PRs for backend, frontend, and Actions |

There's no automated secret scanner in this boilerplate. Never commit `.env`, service account JSON, or any real API key — `.env` is gitignored and `.env.example` ships with empty values for exactly this reason.

---

## HTTP Security (Backend)

### Headers — `helmet`

`helmet()` is the first middleware in `backend/src/app.ts`. It sets:

| Header | Value | Protection |
|--------|-------|------------|
| `X-Content-Type-Options` | `nosniff` | MIME-type sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Clickjacking |
| `X-DNS-Prefetch-Control` | `off` | DNS prefetch leakage |
| `Strict-Transport-Security` | `max-age=15552000` | Downgrade attacks |
| `Referrer-Policy` | `no-referrer` | Referrer leakage |
| `X-Download-Options` | `noopen` | IE download exploit |
| `X-Permitted-Cross-Domain-Policies` | `none` | Flash/Acrobat cross-domain |

### CORS

```typescript
app.use(cors({ origin: process.env.CORS_ORIGIN ?? false }))
```

`false` is the default — all cross-origin requests are denied unless `CORS_ORIGIN` is explicitly set. Set it in `backend/.env` / Cloud Functions environment config:
```bash
CORS_ORIGIN=https://your-app.web.app
```

Do not set `CORS_ORIGIN=*` in production.

### Rate Limiting

Global limiter: 300 requests per 15 minutes per IP address. Responses use RFC 9457 format with `status: 429`.

Add per-endpoint tighter limits on sensitive operations (auth flows, writes):
```typescript
import rateLimit from 'express-rate-limit'

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
})

router.post('/sensitive-action', strictLimiter, handler)
```

### Body Size

Request body is capped at `1mb` (`express.json({ limit: '1mb' })`). Routes that accept file uploads must handle their own higher limit on the specific route only — do not raise the global limit.

---

## HTTP Security (Frontend)

Security headers are set in `next.config.ts` for all routes:

| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | camera, microphone, geolocation, browsing-topics all disabled |

**Content Security Policy (CSP)** is an opt-in per project — it requires nonce injection in `proxy.ts` and a tuned `script-src` for each project's third-party scripts. See Next.js CSP docs when adding it to a client project.

---

## Authentication

### Backend token flow

```
Client → Authorization: Bearer <Firebase ID token>
         ↓
authMiddleware → verifyToken(token) → AuthUser { uid, email, claims }
                 ↓
Route handler → (req as AuthenticatedRequest).user.uid
```

- Tokens expire after 1 hour — the client SDK auto-refreshes via `getIdToken()`
- The `verifyToken` function is injected — pass a mock to `createApp()` in tests without touching Firebase
- Invalid or expired tokens always return `401 Unauthorized` with RFC 9457 format

### Frontend session flow

```
Sign in → Firebase ID token → POST /api/auth/session
                               ↓
                     adminAuth.createSessionCookie()
                               ↓
                     HttpOnly __session cookie (14 days)
                               ↓
proxy.ts: optimistic presence check → gates protected routes
Server Actions: requireAuth() → adminAuth.verifySessionCookie(cookie, true)
```

- `requireAuth()` checks token revocation (`checkRevoked: true`) on every Server Action call
- The `proxy.ts` cookie check is **optimistic** (presence only) — real cryptographic verification always happens in Server Actions near the data
- Session cookies are `HttpOnly`, `Secure` (production), `SameSite=Strict`

### Revoking sessions

To force-sign-out a user:
1. `adminAuth.revokeRefreshTokens(uid)` — revokes all tokens
2. Delete the Firestore `users/{uid}` session record if used
3. Subsequent `verifySessionCookie(cookie, true)` calls will return 401

---

## Input Validation

All route handlers validate `req.body` with Zod before use. Use `.strict()` to reject unknown fields (prevents mass assignment):

```typescript
const schema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
}).strict()  // rejects any fields not listed above

const parsed = schema.safeParse(req.body)
if (!parsed.success) {
  return next(HttpError.badRequest(parsed.error.errors[0]?.message ?? 'Invalid input'))
}
// use parsed.data — fully typed, no unknown fields
```

Never access `req.body.field` directly without a preceding Zod parse.

---

## Error Handling

Errors use RFC 9457 Problem Details format — no stack traces, no internal details leak to the client:

```json
{ "type": "https://httpstatuses.io/404", "title": "Not Found", "status": 404, "detail": "User 'abc' not found" }
```

- `HttpError` (`backend/src/lib/errors.ts`) is the only error type that reaches the client
- Unknown errors log server-side and return `500` with a generic message — never expose stack traces
- `console.error` (not `console.log`) is used for error logging — the conventions test blocks `console.log`

---

## Firestore Security Rules

Rules in `firebase/firestore.rules` are the **last line of defence**. Write rules assuming the client is untrusted and malicious.

### Key principles

- **Default deny** — the catch-all `match /{document=**}` block denies everything not explicitly allowed
- **Owner-only** — users can only access their own documents via `isOwner(uid)`
- **Field allowlists** — `request.resource.data.keys().hasOnly([...])` prevents writing unexpected fields (mass assignment)
- **Immutable fields** — `uid` and `role` cannot be changed by the user after creation
- **Soft-delete only** — `delete: if false` on all user-owned collections; set `deletedAt` field instead
- **notDeleted() guard** — include `&& notDeleted()` in read rules to filter logically deleted docs

### Helper functions

```javascript
isAuthenticated()      // request.auth != null && uid != null
isOwner(uid)           // isAuthenticated() && request.auth.uid == uid
isAdmin()              // reads users/{uid}.role == 'admin' (one Firestore read)
hasCustomClaim(claim)  // request.auth.token[claim] == true (no Firestore read — use for performance)
notDeleted()           // deletedAt field is null or absent
```

Use `hasCustomClaim('admin')` in high-read collections to avoid the Firestore read that `isAdmin()` triggers. Set custom claims via Admin SDK:
```typescript
await adminAuth.setCustomUserClaims(uid, { admin: true })
```

### Deploying rules

```bash
npx firebase-tools deploy --only firestore:rules
```

Never deploy rules from a local machine in production — use the CI deploy workflow.

---

## Firebase Service Account

`FIREBASE_SERVICE_ACCOUNT_KEY_BASE64` is a base64-encoded service account JSON.

**Rules:**
- Never commit this value to version control
- Never use a `NEXT_PUBLIC_` prefix (exposes it to the browser)
- Store in Cloud Functions environment config for production
- Store as a GitHub Actions secret for CI/CD
- Rotate immediately if accidentally exposed: Firebase Console → Project Settings → Service Accounts → Revoke key

**GCP Secret Manager (recommended for production):**
```typescript
// Instead of env var, fetch from Secret Manager at cold start
import { SecretManagerServiceClient } from '@google-cloud/secret-manager'
```
Document this as a per-client hardening step in the forking guide.

---

## Environment Variables

| Classification | Rule |
|----------------|------|
| `NEXT_PUBLIC_*` | Safe for the browser — Firebase client config only |
| Server secrets | Never use `NEXT_PUBLIC_` prefix — enforced by Claude Code hook |
| `.env.local` / `.env` | Gitignored — never commit |
| `.env.example` | Committed with empty values — safe |
| `*.pem`, `*.p12`, `*.key` | Blocked from Claude Code reads via `permissions.deny` |

---

## Dependency Scanning

`pnpm audit --audit-level=high` runs on every PR in CI (`security` job in `ci.yml`). The job fails on any high or critical CVE, blocking the merge.

```bash
# Run locally
pnpm audit --audit-level=high

# Auto-fix where safe
pnpm audit --fix
```

Dependabot opens weekly PRs for outdated packages in `/backend`, `/frontend`, and GitHub Actions workflows (`.github/dependabot.yml`).

---

## Claude Code Security Hooks

The `.claude/settings.json` hooks enforce security patterns automatically:

| Hook | What it blocks |
|------|---------------|
| `permissions.deny` | `rm -rf`, force push, `--no-verify`, `npm`/`yarn`, `curl \| bash`, `wget \| bash`, reading `~/.ssh/**`, `~/.aws/**`, `*.pem`, `*.p12`, `*.key` |
| PostToolUse — `any` block | TypeScript `any` in all forms: `: any`, `as any`, `any[]`, `Promise<any>`, `Record<string, any>` |
| PostToolUse — secret prefix | `NEXT_PUBLIC_` on service accounts, admin keys, or private keys |
| PostToolUse — env files | Blocks writing `.env.local`, `.env.production`, `.env.staging` (only `.env.example` is safe) |
| PostToolUse — admin.ts | Blocks `'use client'` in `lib/firebase/admin.ts` |
| PreToolUse — firebase deploy | Blocks `firebase deploy` — requires explicit user approval |
| PreToolUse — git push | Blocks direct pushes to `main` |

---

## Opt-In Security Hardening (Per Client)

These are not enabled by default because they require per-project configuration:

### Firebase App Check

Prevents non-app clients (curl, scanners) from calling the API:

```typescript
// backend/src/index.ts
export const api = onRequest(
  { enforceAppCheck: true, consumeAppCheckToken: true, ... },
  app
)
```

Requires App Check initialization in the frontend Firebase SDK. Document the setup steps before enabling on a client project.

### Content Security Policy

Blocks XSS by restricting which scripts can execute. Requires nonce injection in `proxy.ts` — see the Next.js CSP guide. The `script-src` directive must be tuned to each project's third-party scripts (Google Analytics, Intercom, etc.).

### GCP Secret Manager

Replaces environment variable secrets with Secret Manager references. Recommended for projects with strict compliance requirements (SOC 2, ISO 27001, healthcare).

### Email Enumeration Protection

Enable in Firebase Auth: Authentication → Settings → Email enumeration protection. Returns generic errors for sign-in attempts on non-existent accounts (prevents user discovery).

### Firestore Field-Level Validation

Add `request.resource.data.size() == N` and field-type checks on write rules for collections that store sensitive data:
```javascript
allow create: if request.resource.data.keys().hasOnly(['title', 'uid', '_schemaVersion'])
  && request.resource.data.title is string
  && request.resource.data.title.size() <= 200;
```
