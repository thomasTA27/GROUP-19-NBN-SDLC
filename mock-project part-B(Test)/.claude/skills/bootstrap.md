---
description: Full local bootstrap — from fresh clone to the app running against a real Firebase project. Checks prerequisites, installs dependencies, walks through creating a free Firebase project and filling the root .env, starts the dev server, and smoke-tests the auth round trip. Use on first setup or whenever local dev is broken.
---

# Skill: /bootstrap

Take the repo from fresh clone to a **running app against a real Firebase project**, end to end, verifying every step. Do not stop at the first success message — the job is done only when the smoke test in Step 5 passes.

There is no local emulator in this project — the app always talks to the real Firebase project configured in `.env`. Firebase's free Spark plan covers Authentication and Firestore, so no billing is required.

## Step 1 — Preflight

```bash
node --version   # need >= 22
pnpm --version    # need >= 10
```

If either is missing or too old, stop and tell the user what to install.

## Step 2 — Install dependencies

```bash
pnpm install
```

| If you see | Fix |
|------------|-----|
| `ERR_PNPM_IGNORED_BUILDS` / "Ignored build scripts" | `pnpm-workspace.yaml` must contain an `allowBuilds:` map with `'@firebase/util'`, `esbuild`, `lefthook`, `protobufjs`, `sharp`, `unrs-resolver` all set to `true`. Fix it, re-run `pnpm install`. |
| `'next' is not recognized` later | Re-run `pnpm install` from the **repo root**. |

Confirm Lefthook hooks installed (install output shows `sync hooks: ✔️`).

## Step 3 — The one env file

All configuration lives in the **root `.env`** (never edit `frontend/.env.local` / `backend/.env` — they are generated).

1. If `.env` does not exist: `cp .env.example .env`
2. Ask the user if they already have a Firebase project for this repo. If not, walk them through:
   - Create a project at https://console.firebase.google.com (free Spark plan — no billing needed)
   - Build → Authentication → get started → enable a sign-in method (Email/Password is simplest)
   - Build → Firestore Database → create database (start in production mode; rules already live in `firebase/firestore.rules`)
3. Fill `.env` from the Firebase console:
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID` — Project settings → General → Project ID
   - `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64` — Project settings → Service accounts → Generate new private key, then base64-encode the downloaded JSON (macOS: `base64 -i service-account.json | tr -d '\n'` — BSD `base64` has no `-w` flag; Linux: `base64 -w 0 service-account.json`)
   - `NEXT_PUBLIC_FIREBASE_*` — Project settings → Your apps → add/open a web app → copy the `firebaseConfig` values
   - `NEXT_PUBLIC_APP_NAME`
4. `.firebaserc` → `projects.default` must equal `NEXT_PUBLIC_FIREBASE_PROJECT_ID`.
5. `pnpm run env:sync`

Verify: `frontend/.env.local` and `backend/.env` exist and contain the values from `.env` (`NEXT_PUBLIC_FIREBASE_PROJECT_ID`, `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64`, etc).

## Step 4 — Start the app

```bash
pnpm run dev
```

Run in the background, then wait for `http://localhost:3000` → 200 (first compile can take ~30 s).

## Step 5 — Smoke test (mandatory — this defines "done")

```bash
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000                 # 200
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/auth/signin    # 200
curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/dashboard      # 307 (redirect to signin)
```

Then the full auth round trip against the real project, using the Identity Toolkit REST API and the web API key from `.env` (`NEXT_PUBLIC_FIREBASE_API_KEY`):

```bash
API_KEY=<value of NEXT_PUBLIC_FIREBASE_API_KEY from .env>

# 1. create a throwaway test user directly against Firebase Auth
IDTOKEN=$(curl -s -X POST "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=$API_KEY" \
  -H 'Content-Type: application/json' \
  -d '{"email":"smoke-test@example.com","password":"test1234","returnSecureToken":true}' | jq -r .idToken)

# 2. exchange it for a session cookie via the app's own route
curl -s -c /tmp/bootstrap-smoke.txt -X POST http://localhost:3000/api/auth/session \
  -H 'Content-Type: application/json' -d "{\"token\":\"$IDTOKEN\"}"          # {"success":true}

# 3. protected page with the cookie
curl -s -o /dev/null -w '%{http_code}' -b /tmp/bootstrap-smoke.txt http://localhost:3000/dashboard   # 200
```

If step 1 fails, Email/Password sign-in is likely not enabled in the Firebase console (Authentication → Sign-in method). Delete the throwaway user afterwards from the Firebase console (Authentication → Users) — it's real data in a real project.

If step 2 returns 401, check the dev server log — a `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64` error means it's empty or malformed in `.env` (re-run `pnpm run env:sync` and restart dev).

## Step 6 — Report

Output a summary the user can act on:

```
## Bootstrap complete ✅

Firebase project: <NEXT_PUBLIC_FIREBASE_PROJECT_ID>
App:              http://localhost:3000
Test user:        smoke-test@example.com / test1234 (delete from Firebase console when done)

| Check | Result |
|-------|--------|
| Dependencies + git hooks | ✅ |
| .env → generated env files | ✅ |
| App pages (/, /auth/signin, /dashboard gate) | ✅ |
| Auth round trip (signup → session → dashboard) | ✅ |

Next: sign up in the browser, then read docs/GUIDE.md §4 to build your first feature.
```

If ANY check failed, the verdict is **NOT BOOTSTRAPPED** — show which step, the error, and the fix from the tables above. Never report success with a failing smoke test.
