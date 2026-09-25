---
description: Scaffold a complete feature module under frontend/src/features/ — types, hook, Server Actions, and component. Use when building a new business domain feature.
argument-hint: "[feature-name e.g. invoices]"
---

# Skill: /new-feature

Scaffold a complete feature module under `src/features/` in the `frontend/` package.

## Step 1 — Gather requirements

Ask the user:
1. **Feature name** (e.g., `invoices`, `team-members`, `projects`) — use kebab-case for the folder, PascalCase for types/components
2. **Data model fields** — what fields does the primary document have?
3. **Access pattern** — owner-only, all authenticated users, or public?
4. **Realtime?** — does the UI need live Firestore updates (`onSnapshot`) or one-time reads (`getDocs`)?

## Step 2 — Files to create

Given feature name `{feature}` and model name `{Model}`:

### `frontend/src/features/{feature}/types.ts`
```typescript
import type { Timestamp } from 'firebase/firestore'

export interface {Model} {
  id: string
  uid: string // owning user UID
  // ... user-defined fields
  createdAt: Timestamp
  updatedAt: Timestamp
  _schemaVersion: 1 // required on every collection — see docs/FIRESTORE-SCHEMA.md
}

export type Create{Model}Input = Omit<{Model}, 'id' | 'createdAt' | 'updatedAt'>
export type Update{Model}Input = Partial<Omit<{Model}, 'id' | 'uid' | 'createdAt' | 'updatedAt'>>
```

### `frontend/src/features/{feature}/hooks/use{Feature}.ts`
- Import typed collection from `@/lib/firebase/firestore`
- Return `{ data, loading, error }` shape
- Use `onSnapshot` for realtime; `getDocs`/`getDoc` for one-time
- Clean up subscription in `useEffect` return

### `frontend/src/features/{feature}/actions/{feature}.actions.ts`
```typescript
'use server'
import { adminDb } from '@/lib/firebase/admin'
import { requireAuth } from '@/actions/auth.actions'
import { revalidatePath } from 'next/cache'
import type { Create{Model}Input, Update{Model}Input } from '../types'
import type { ActionResult } from '@/types'

export async function create{Model}(input: Create{Model}Input): Promise<ActionResult<string>> { ... }
export async function update{Model}(id: string, input: Update{Model}Input): Promise<ActionResult> { ... }
export async function delete{Model}(id: string): Promise<ActionResult> { ... }
```

### `frontend/src/features/{feature}/components/{Model}List.tsx`
Basic list/table component using raw Tailwind classes (not shadcn, to keep it simple).

## Step 3 — Cross-cutting updates

After creating the feature files, also update:

1. **`frontend/src/lib/firebase/firestore.ts`** — add typed collection export (function-style, matching the existing `getUsersCollection()` pattern):
   ```typescript
   export function get{Model}sCollection() {
     return typedCollection<{Model}>('{collection_name}')
   }
   export function {feature}Doc(id: string) { return doc(get{Model}sCollection(), id) }
   ```

2. **`frontend/src/types/firestore.ts`** — add the type (or re-export from feature)

3. **`firebase/firestore.rules`** — add security rules for the new collection

4. **`docs/FIRESTORE-SCHEMA.md`** — document the new schema

## Checklist
- [ ] Types defined and exported
- [ ] Typed collection added to `firestore.ts`
- [ ] Security rules added to `firestore.rules`
- [ ] Hook returns `{ data, loading, error }`
- [ ] Server Actions use `requireAuth()` before any DB operation
- [ ] Schema documented in `FIRESTORE-SCHEMA.md`
