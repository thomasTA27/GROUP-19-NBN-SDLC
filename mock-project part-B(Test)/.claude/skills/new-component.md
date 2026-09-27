---
description: Create a typed React component (Server or Client) with Props interface. Use when adding a reusable UI component.
argument-hint: "[ComponentName] [server|client]"
---

# Skill: /new-component

Create a new React component in the `frontend/` package.

## Step 1 — Gather requirements

Ask the user:
1. **Component name** (PascalCase, e.g., `InvoiceCard`)
2. **Location**:
   - `frontend/src/components/layout/` — structural/shell (Navbar, Sidebar, shells)
   - `frontend/src/components/auth/` — auth-specific UI
   - `frontend/src/components/shared/` — reusable across features
   - `frontend/src/features/{feature}/components/` — feature-specific
3. **Server or Client Component?** Needs hooks/events/browser APIs → Client; otherwise Server
4. **Props** — what data does it receive?

## Step 2 — Templates

### Server Component
```typescript
// frontend/src/components/{category}/{ComponentName}.tsx

interface {ComponentName}Props {
  // props here
}

export function {ComponentName}({ ...props }: {ComponentName}Props) {
  return (
    <div>
      {/* content */}
    </div>
  )
}
```

### Client Component
```typescript
// frontend/src/components/{category}/{ComponentName}.tsx
'use client'

import { useState } from 'react'

interface {ComponentName}Props {
  // props here
}

export function {ComponentName}({ ...props }: {ComponentName}Props) {
  return (
    <div>
      {/* content */}
    </div>
  )
}
```

## Rules

- **Named exports** for all non-page components (not `export default`)
- Props interface is always `{ComponentName}Props`
- Use `cn()` from `@/lib/utils` for conditional Tailwind classes
- Prefer raw Tailwind over arbitrary CSS
- Never hardcode colours — use Tailwind semantic tokens
- Don't add `'use client'` unless you actually need hooks, event handlers, or browser APIs
- Don't use `React.FC` — use a plain function with typed props

## Checklist
- [ ] Named export
- [ ] Props interface defined
- [ ] `'use client'` only if truly needed
- [ ] No hardcoded colour values
