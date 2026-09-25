# Part 1 — Setup & Run the Boilerplate

This is a no-shortcuts version of setup: no AI tools, no Claude Code skills. Every step tells you
exactly what to click, what to type, and where each value goes. By the end, the app will be
running on your machine, signed in, and talking to your own real Firebase project.

**Part 2** — [COPY-PASTE-FEATURE.md](COPY-PASTE-FEATURE.md) — picks up from here and walks you
through building an actual feature, including git branching and committing. Do this part first.

---

## What you need installed

| Tool | Check you have it | Get it |
|------|--------------------|--------|
| Node.js 22 or newer | `node --version` | [nodejs.org](https://nodejs.org) |
| pnpm | `pnpm --version` | `npm install -g pnpm` |

That's the whole list. No Docker, no Firebase CLI install, no database to run locally — the app
always talks to a real (free) Firebase project.

---

## Step 1 — Clone and install

```bash
git clone https://github.com/RMIT-Garage/garage-boilerplate-basic.git my-project
cd my-project
pnpm run bootstrap
```

`bootstrap` installs every dependency, wires up git hooks, and creates a file called `.env` at
the repo root (copied from `.env.example`) with all the values empty. You'll fill it in over the
next few steps.

If you see a warning about "Ignored build scripts" — that's expected on first install, not an
error. If you see an actual error, re-run `pnpm install` from the repo root.

---

## Step 2 — Create a Firebase project

Go to [console.firebase.google.com](https://console.firebase.google.com) and sign in with a
Google account.

1. Click **Create a project** (or **Add project**).
2. Give it a name — anything you like, e.g. `my-capstone-app`. Firebase will generate a unique
   project ID underneath it (something like `my-capstone-app-a1b2c`) — you'll need this exact ID
   later, so keep the tab open.
3. When asked about Google Analytics, you can turn it **off** — not needed for this project.
4. Click **Create project** and wait for it to finish (~30 seconds).

You do **not** need to enter a credit card or upgrade any billing plan. The free **Spark plan**
covers everything this boilerplate uses.

### Enable Authentication

1. In the left sidebar, click **Build → Authentication**.
2. Click **Get started**.
3. Under **Sign-in method**, click **Email/Password**.
4. Toggle it **Enabled**, then click **Save**.

### Enable Firestore

1. In the left sidebar, click **Build → Firestore Database**.
2. Click **Create database**.
3. Choose **Start in production mode** (the app ships its own security rules — see
   `firebase/firestore.rules` — so production mode is correct from the start).
4. Pick any location close to you, then click **Enable**.

---

## Step 3 — Get your web app config

1. Click the **gear icon** next to "Project Overview" (top-left) → **Project settings**.
2. Scroll down to **Your apps**. Click the **`</>`** (web) icon to register a new web app.
3. Give it any nickname (e.g. `web`), click **Register app**. You do **not** need Firebase
   Hosting — skip that checkbox if offered.
4. You'll see a code block called `firebaseConfig` with values like this:

   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "my-capstone-app-a1b2c.firebaseapp.com",
     projectId: "my-capstone-app-a1b2c",
     storageBucket: "my-capstone-app-a1b2c.firebasestorage.app",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef",
     measurementId: "G-XXXXXXX"
   };
   ```

Keep this visible — you'll copy each value into `.env` in Step 5. (Ignore `storageBucket` — this
boilerplate doesn't use Firebase Storage.)

---

## Step 4 — Get your service account key

This is a **server-only secret** — it lets the backend read and write Firestore directly. Never
commit it, never share it.

1. Still in **Project settings**, click the **Service accounts** tab.
2. Click **Generate new private key**, then confirm. A `.json` file downloads to your computer.
3. Base64-encode it (this turns the file into one long line of text that fits in an env
   variable):

   ```bash
   # macOS (BSD base64 — no -w flag)
   base64 -i service-account.json | tr -d '\n'

   # Linux (GNU base64)
   base64 -w 0 service-account.json

   # Windows PowerShell
   [Convert]::ToBase64String([IO.File]::ReadAllBytes('C:\path\to\service-account.json'))
   ```

4. Copy the entire output (it's long — one continuous string, no line breaks).
5. Delete the downloaded `.json` file once you've copied it — the value now lives in `.env`.

---

## Step 5 — Fill in `.env`

Open the root `.env` file (created in Step 1) in your code editor. Fill in each value:

| Variable | Where it comes from |
|----------|---------------------|
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | The project ID from Step 2 (e.g. `my-capstone-app-a1b2c`) |
| `FIREBASE_SERVICE_ACCOUNT_KEY_BASE64` | The long string from Step 4 |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `apiKey` from Step 3 |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `authDomain` from Step 3 |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `messagingSenderId` from Step 3 |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `appId` from Step 3 |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `measurementId` from Step 3 (leave blank if you skipped Analytics) |
| `NEXT_PUBLIC_APP_URL` | Leave as `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | Anything — this is what shows in the browser tab |

Every other line in `.env` (`CORS_ORIGIN`, `PORT`, `STITCH_API_KEY`) can stay empty.

## Step 6 — Set the project ID in `.firebaserc`

Open `.firebaserc` at the repo root. Replace the placeholder with your real project ID from
Step 2:

```json
{
  "projects": {
    "default": "my-capstone-app-a1b2c"
  }
}
```

## Step 7 — Sync and run

```bash
pnpm run env:sync
pnpm run dev
```

`env:sync` copies your `.env` values into `frontend/.env.local` and `backend/.env` (generated
files — never edit those two directly; always edit the root `.env` and re-run `env:sync`, or just
restart `pnpm run dev`, which syncs automatically).

Open [http://localhost:3000](http://localhost:3000).

---

## Verify it actually works

1. Click **Sign up**, create an account with any email/password.
2. You should land on `/dashboard`.
3. Back in the Firebase console: **Authentication → Users** should show your new user.
   **Firestore Database → Data** should show a `users` collection with one document.

If both of those are true, the whole stack is working: sign-up → Firebase Auth → session cookie →
Firestore write → protected page. You're ready for
**[Part 2 — build a feature](COPY-PASTE-FEATURE.md)**.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `auth/invalid-api-key` on startup | A `NEXT_PUBLIC_FIREBASE_*` value in `.env` is empty or wrong. Fix it, run `pnpm run env:sync`, restart `pnpm run dev`. |
| `Invalid project id: REPLACE_WITH_...` | You skipped Step 6 — set the real project id in `.firebaserc`. |
| Changed `.env`, nothing happened | `NEXT_PUBLIC_*` values are baked in when the dev server starts — restart `pnpm run dev` (it re-syncs automatically). |
| Edited `frontend/.env.local` or `backend/.env` directly | Those are generated — edits get overwritten. Change the root `.env` instead. |
| `'next' is not recognized` / `Command "next" not found` | Run `pnpm install` from the **repo root**, not from `frontend/`. |
| Sign-up fails silently | Check Firebase console → Authentication → Sign-in method — make sure Email/Password is enabled (Step 2). |
