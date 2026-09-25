---
description: Add a new typed Firestore collection — creates the TypeScript type, typedCollection export, Firestore security rules, and FIRESTORE-SCHEMA.md entry. Use when adding a new collection to the data model.
argument-hint: "[CollectionName e.g. Posts]"
---

# Skill: /firebase-collection

Add a new typed Firestore collection with full integration across types, lib, security rules, and docs.

## Step 1 — Gather requirements

Ask the user:
1. **Collection name** (plural, snake_case, e.g., `invoices`, `team_members`)
2. **Model name** (PascalCase singular, e.g., `Invoice`, `TeamMember`)
3. **Fields** — list with types
4. **Access pattern**:
   - `owner-only` — user can only read/write their own documents
   - `org-shared` — all authenticated users in an org can read; owner can write
   - `public-read` — anyone can read; auth required to write
5. **Realtime subscription needed?** (onSnapshot vs one-time getDocs)

## Step 2 — Files to update/create

### 1. `frontend/src/types/firestore.ts` — add the type

```typescript
export interface {Model} {
  id: string
  uid: string
  // ... fields
  createdAt: Timestamp
  updatedAt: Timestamp
  _schemaVersion: 1  // required on every collection — see docs/FIRESTORE-SCHEMA.md
}

export type Create{Model}Input = Omit<{Model}, 'id' | 'createdAt' | 'updatedAt'>
```

### 2. `frontend/src/lib/firebase/firestore.ts` — add typed collection

Follow the existing function-style pattern (`typedCollection` is module-private; collections are exposed as `get*Collection()` functions because the client SDK initializes lazily):

```typescript
import type { {Model} } from '@/types/firestore'

export function get{Model}sCollection() {
  return typedCollection<{Model}>('{collection_name}')
}

export function {model}Doc(id: string) {
  return doc(get{Model}sCollection(), id)
}
```

### 3. `firebase/firestore.rules` — add security rules

For owner-only pattern:
```
match /{collection_name}/{docId} {
  allow read:   if isAuthenticated() && isOwner(resource.data.uid);
  allow create: if isAuthenticated() && isOwner(request.resource.data.uid)
                && request.resource.data.keys().hasAll(['uid', ...required_fields]);
  allow update: if isAuthenticated() && isOwner(resource.data.uid)
                && request.resource.data.uid == resource.data.uid;
  allow delete: if isAuthenticated() && isOwner(resource.data.uid);
}
```

### 4. `frontend/src/features/{feature}/hooks/use{Model}s.ts` — create hook

Returns `{ data, loading, error }`. Use `useCollection()` from `@/hooks/useFirestore`.

### 5. `frontend/src/features/{feature}/actions/{feature}.actions.ts` — create Server Actions

Use `adminDb` from `@/lib/firebase/admin`. Always call `requireAuth()` first.
Return `ActionResult<T>` shape: `{ success: boolean, error?: string, data?: T }`.

### 6. `docs/FIRESTORE-SCHEMA.md` — document the schema

Add a section with the collection name, field descriptions, and access pattern.

## Step 3 — Remind user

After all files are created:
> "Run `npx firebase-tools deploy --only firestore:rules` (or `npx firebase-tools deploy --only firestore`) to push the updated security rules to production."
> "If you added a composite index, add it to `firebase/firestore.indexes.json` and deploy with `npx firebase-tools deploy --only firestore:indexes`."
