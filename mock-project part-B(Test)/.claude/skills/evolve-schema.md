---
description: Safely evolve a Firestore collection schema — updates the TypeScript type, writes a migration script, updates security rules, and documents the change. Use when adding, renaming, or removing fields from an existing collection.
argument-hint: "[CollectionName] [add|rename|remove] [fieldName]"
---

# Skill: /evolve-schema

Safely evolve a Firestore collection schema — adding, renaming, or removing fields.

## Step 1 — Gather requirements

Ask the user:
1. **Collection name** — which collection is changing?
2. **Change type**:
   - `add-field` — add a new optional or required field
   - `rename-field` — rename an existing field
   - `remove-field` — remove a field (soft or hard)
   - `change-type` — change a field's type
3. **Migration scope** — how many documents? Can it be done lazily (on read) or does it need a bulk script?

## Step 2 — Assess impact

Before writing any code, evaluate:
- Does the change break existing security rules?
- Does the change break existing TypeScript types?
- Does it break existing Firestore queries (index changes)?
- Is this change backwards-compatible (can old clients still read/write)?

## Step 3 — Files to update

### For `add-field`:

1. **`frontend/src/types/firestore.ts`** — add field with `?` if optional, or with a default in the creation function
2. **`frontend/src/lib/firebase/firestore.ts`** — no change needed unless index is required
3. **`firebase/firestore.rules`** — if the field must exist on create, add it to `hasAll([...])`
4. **`docs/FIRESTORE-SCHEMA.md`** — document the new field

### For `rename-field` or `remove-field`:

These are **breaking changes**. Recommended approach:
1. Add the new field alongside the old one (additive)
2. Deploy rules and code that write both fields
3. Run a migration script to backfill old documents
4. Remove reads of the old field from all clients
5. Remove writes of the old field
6. Deploy rules that no longer reference the old field
7. Remove the old field from the TypeScript type

### Migration script template

For bulk backfills, create `scripts/migrate-{collection}-{description}.js`:
```javascript
const admin = require('firebase-admin')
// Initialize admin with service account
const db = admin.firestore()

async function migrate() {
  const snap = await db.collection('{collection}').get()
  const batch = db.batch()
  let count = 0

  for (const doc of snap.docs) {
    batch.update(doc.ref, {
      newField: computeNewValue(doc.data()),
      // oldField: admin.firestore.FieldValue.delete(),  // only after all clients updated
    })
    count++
    if (count % 500 === 0) {
      await batch.commit()
      console.log(`Migrated ${count} documents`)
    }
  }
  await batch.commit()
  console.log(`Done. Total: ${count} documents`)
}

migrate().catch(console.error)
```

## Checklist

- [ ] TypeScript type updated
- [ ] Security rules updated if field is required on create
- [ ] Firestore index updated if new field is queried
- [ ] `docs/FIRESTORE-SCHEMA.md` updated
- [ ] Migration strategy documented if this is a breaking change
- [ ] Migration script created if bulk backfill is needed
