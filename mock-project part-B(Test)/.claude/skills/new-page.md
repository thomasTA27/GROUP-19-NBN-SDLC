---
description: Create a new Next.js App Router page in the correct route group ((auth) or (dashboard)). Use when adding a new page to the frontend.
argument-hint: "[page-name] [(auth)|(dashboard)]"
---

# Skill: /new-page

Create a new Next.js App Router page in the `frontend/` package.

## Step 1 — Gather requirements

Ask the user:
1. **Route path** (e.g., `/dashboard/invoices`, `/settings/billing`)
2. **Route group** — protected `(dashboard)` or public/auth `(auth)`? Or root-level?
3. **Dynamic segments?** — e.g., `/invoices/[id]`
4. **Data needed** — what Firestore data does this page display?
5. **Client interactivity?** — does it need useState/event handlers beyond a form submit?

## Step 2 — Rules

- Protected pages → `frontend/src/app/(dashboard)/{route}/page.tsx`
- Auth pages → `frontend/src/app/(auth)/{route}/page.tsx`
- Marketing pages → `frontend/src/app/{route}/page.tsx`
- **Pages are Server Components by default**
- If client interactivity is needed, extract it to a `{PageName}Client.tsx` component in the same folder; keep `page.tsx` as the Server Component wrapper

## Step 3 — File to create

### `page.tsx` template (Server Component)
```typescript
import type { Metadata } from 'next'
import { requireAuth } from '@/actions/auth.actions'  // omit for public pages
import { PageHeader } from '@/components/layout/PageHeader'

export const metadata: Metadata = {
  title: '{Page Title}',
  description: '{Page description}',
}

export default async function {PageName}Page() {
  await requireAuth()  // omit for public pages

  // Fetch server-side data here using adminDb
  // const data = await adminDb.collection('...').get()

  return (
    <div className="space-y-6">
      <PageHeader title="{Page Title}" description="{subtitle}" />
      {/* Page content */}
    </div>
  )
}
```

### For dynamic routes `[id]`
Also export `generateMetadata`:
```typescript
export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  return { title: `Item ${id}` }
}
```

## Step 4 — Checklist

- [ ] File created in the correct route group
- [ ] `metadata` is exported
- [ ] `requireAuth()` is called for protected pages
- [ ] Client interactivity is in a separate `*Client.tsx` component
- [ ] Add a nav link in `frontend/src/components/layout/Sidebar.tsx` if it should appear in the sidebar
