# CI/CD

## Pipeline Overview

The frontend and the Firebase-owned pieces deploy through two independent paths:

```
PR opened/updated
    │
    ▼
CI (ci.yml)
├── Lint + Typecheck
├── Frontend unit tests
├── Backend unit tests
└── Security scan (pnpm audit --audit-level=high)
    │
    ▼ (all green)
Merge to main
    │
    ├──▶ Vercel (its own GitHub integration, not this repo's Actions)
    │    └── Builds + deploys the frontend automatically — no Blaze plan needed
    │
    └──▶ Deploy (deploy.yml)
         └── Firestore rules — always deploys on push, free (no Blaze needed)

         Backend (Cloud Function) — manual only, via "Run workflow" in the
         Actions tab. Requires the Firebase project to be on the Blaze plan.
```

**Why the frontend isn't in `deploy.yml`:** this app is server-rendered (Server Actions, `/api/auth/session`, `proxy.ts`), so it needs a server host, not static Firebase Hosting. Vercel's free Hobby tier runs Next.js SSR natively with no billing account required — see **Vercel Setup** below. Firebase Hosting could also do this via its `frameworksBackend` integration, but that runs on Cloud Functions/Cloud Run under the hood, which requires the paid Blaze plan even at zero traffic — Vercel avoids that entirely for the frontend.

## Vercel Setup (Frontend)

1. [vercel.com](https://vercel.com) → **Add New Project** → import this GitHub repo
2. **Root Directory**: set to `frontend` (this is a pnpm workspace monorepo — Vercel auto-detects the Next.js app once the root directory is set)
3. **Environment Variables** — add these in the Vercel project settings (Production, and Preview if you want PR previews to work):

   | Variable | Value |
   |----------|-------|
   | `NEXT_PUBLIC_FIREBASE_API_KEY` | from `firebaseConfig` |
   | `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | from `firebaseConfig` |
   | `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | from `firebaseConfig` — same name as in your root `.env` |
   | `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | from `firebaseConfig` |
   | `NEXT_PUBLIC_FIREBASE_APP_ID` | from `firebaseConfig` |
   | `NEXT_PUBLIC_APP_NAME` | app display name |
   | `NEXT_PUBLIC_APP_URL` | your Vercel production URL, once known |
   | `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64` | base64-encoded service account JSON (server-only — do **not** prefix with `NEXT_PUBLIC_`) |

4. Deploy. Every push to `main` auto-deploys to production from then on — there's no approval gate on Vercel's side, so treat merging to `main` as shipping.
5. If you later add the `backend/` Express API and need the frontend to call it cross-origin, set `CORS_ORIGIN` in the backend's env to your Vercel production URL.

## GitHub Actions Secrets Required (for `deploy.yml`)

Add these in **GitHub → Settings → Secrets and variables → Actions**:

| Secret | Description |
|--------|-------------|
| `FIREBASE_PROJECT_ID` | Firebase project ID (used as `--project` flag). GitHub Actions secrets are never exposed to a browser, so this one intentionally keeps the bare name instead of the `NEXT_PUBLIC_` prefix used in `.env`/Vercel — value is the same project ID either way. |
| `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64` | Base64-encoded service account JSON |

### Getting the service account key

1. Firebase Console → Project Settings → Service Accounts
2. Click **Generate new private key** → download the JSON file
3. Encode it:

```bash
# macOS (BSD base64 — no -w flag)
base64 -i service-account.json | tr -d '\n'

# Linux (GNU base64)
base64 -w 0 service-account.json

# Windows PowerShell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("service-account.json"))
```

4. Add the output as `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64` in both GitHub secrets and Vercel's environment variables.

> **Note:** `firebase login:ci` tokens are deprecated. This project uses `GOOGLE_APPLICATION_CREDENTIALS` via the service account key, which is the current recommended approach.

## Manual Deployment

```bash
# Authenticate locally (one-time) — no install needed, npx runs the CLI on demand
npx firebase-tools login

# Firestore rules — free, no Blaze needed
npx firebase-tools deploy --only firestore:rules
npx firebase-tools deploy --only firestore:indexes

# Backend Cloud Function — optional, requires the Blaze plan
npx firebase-tools deploy --only functions
```

The frontend has no manual `firebase deploy` equivalent — it deploys via Vercel (dashboard push, or `vercel --prod` with the Vercel CLI if installed).

## Environments

| Environment | Branch | Auto-deploy |
|-------------|--------|-------------|
| Production frontend | `main` | Yes, via Vercel's GitHub integration |
| Production Firestore rules | `main` | Yes, via `deploy.yml` |
| Production backend (optional) | `main` | No — manual `workflow_dispatch` only |
| Staging | _set up per project_ | Optional |
| Local | your own free Firebase project | `pnpm run dev` |
