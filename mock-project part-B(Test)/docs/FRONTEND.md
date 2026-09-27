# Frontend

## Overview

Next.js 16 App Router with React 19, TypeScript (strict), and Tailwind CSS v4.

## Key Conventions

### Server vs Client Components

- **Default: Server Component** — no `'use client'` directive needed
- Add `'use client'` only when you need: React hooks, event handlers, browser APIs, or Firebase client SDK
- Pages in `app/` are Server Components; extract interactivity to `*Client.tsx` components

### Route Groups

| Group | Path | Purpose |
|-------|------|---------|
| `(auth)` | `/auth/signin`, `/auth/signup` | Minimal centered layout, no sidebar |
| `(dashboard)` | `/dashboard`, `/profile`, `/settings` | Full app shell with sidebar + navbar |
| _(root)_ | `/` | Landing/marketing page |

### Feature Modules

New business domains go in `src/features/{feature}/`:

```
src/features/invoices/
├── types.ts          TypeScript interfaces
├── hooks/
│   └── useInvoices.ts  Firestore subscription hook
├── actions/
│   └── invoices.actions.ts  Server Actions
└── components/
    └── InvoiceList.tsx
```

Use the `/new-feature` skill to scaffold this structure.

### Data Fetching

| Context | Method | When |
|---------|--------|------|
| Server Component | `adminDb.collection(...).get()` | One-time, SSR |
| Client Component | `useCollection()` hook | Real-time subscription |
| Server Action | `adminDb` + `requireAuth()` | Mutations |
| Route Handler | `adminAuth.verifySessionCookie()` | Session management |

### Styling

Tailwind CSS v4 uses CSS-first config. Key patterns:

```tsx
// Conditional classes
import { cn } from '@/lib/utils'
<div className={cn('base-class', isActive && 'active-class', className)} />

// Dark mode: use Tailwind dark: prefix
<div className="bg-white dark:bg-zinc-900" />
```

## Authentication UI Flow

```
/ (landing) → /auth/signin → /dashboard
                  ↓
             /auth/signup → /dashboard
```

- `AuthProvider` listens to `onAuthStateChanged` — wraps the root layout
- `useAuth()` hook accesses auth state in any Client Component
- `requireAuth()` Server Action gates Server Components in the dashboard layout

## Adding a Page

Use the `/new-page` skill. Key checklist:
- Correct route group (`(auth)` or `(dashboard)`)
- Export `metadata` object
- Call `requireAuth()` in protected pages
- Put client interactivity in a `*Client.tsx` component
