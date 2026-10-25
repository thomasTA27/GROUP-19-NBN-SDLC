# Design System

This document is the design reference for Claude when building UI in this project.
Read it before creating or editing any component, page, or stylesheet.

---

## Foundation: Tailwind CSS v4

This project uses Tailwind v4 with **CSS-first configuration** — there is no `tailwind.config.js`.

**How it works:**

```css
/* globals.css */
@import "tailwindcss";

@theme {
  /* Override or extend the default theme here with CSS custom properties */
  --font-sans: var(--font-geist-sans), ui-sans-serif, system-ui, sans-serif;
  --font-mono: var(--font-geist-mono), ui-monospace, monospace;

  /* Custom colors */
  --color-brand-50:  #eff6ff;
  --color-brand-500: #3b82f6;
  --color-brand-900: #1e3a8a;
}
```

- Use `@theme` to define or extend design tokens as CSS custom properties
- Utilities are generated from the theme automatically — `bg-brand-500` just works
- No arbitrary values unless truly necessary — always define a token first
- No inline `style=` attributes — everything is Tailwind classes

---

## Color System

| Token | Purpose |
|-------|---------|
| `zinc-*` | Neutral grays — backgrounds, borders, text |
| `brand-*` | Primary brand color (define per project in `@theme`) |
| `red-*` | Destructive actions, error states |
| `green-*` | Success states |
| `yellow-*` / `amber-*` | Warning states |
| `white` / `black` | Absolute white/black |

**Semantic usage:**
- Page backgrounds: `bg-white` / `bg-zinc-50`
- Card surfaces: `bg-white` with `border border-zinc-200`
- Body text: `text-zinc-900`
- Muted text: `text-zinc-500`
- Borders: `border-zinc-200` (light), `border-zinc-300` (input)
- Focus rings: `ring-2 ring-brand-500 ring-offset-2`

---

## Typography

Fonts are loaded via `next/font/google` in the root layout and exposed as CSS variables:

| Variable | Font | Use |
|----------|------|-----|
| `--font-geist-sans` | Geist Sans | All body text, UI |
| `--font-geist-mono` | Geist Mono | Code, monospace |

**Type scale:**

| Class | Use |
|-------|-----|
| `text-xs` | Labels, helper text, badges |
| `text-sm` | Secondary body, form hints, table cells |
| `text-base` | Primary body text |
| `text-lg` | Section subheadings |
| `text-xl` | Card titles |
| `text-2xl` | Page headings |
| `text-3xl`+ | Hero / marketing headings |

**Font weight:**
- `font-normal` — body text
- `font-medium` — labels, button text, nav items
- `font-semibold` — section headings, card titles
- `font-bold` — page titles only

---

## Spacing

Use the default Tailwind spacing scale. Do not define custom spacing tokens unless the design explicitly requires it.

- Component internal padding: `p-4` (cards), `px-4 py-2` (buttons), `px-3 py-2` (inputs)
- Section vertical spacing: `gap-6` or `space-y-6`
- Page layout: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`

---

## Layout

### Page structure

```tsx
// Protected pages use DashboardShell (wraps Sidebar + Navbar)
// Add content inside the shell's main area:

<PageHeader title="Users" description="Manage user accounts" />
<div className="mt-6">
  {/* page content */}
</div>
```

### Responsive breakpoints

| Prefix | Width | Use |
|--------|-------|-----|
| (none) | 0px+ | Mobile first — always start here |
| `sm:` | 640px+ | Large phones / small tablets |
| `md:` | 768px+ | Tablets |
| `lg:` | 1024px+ | Laptops |
| `xl:` | 1280px+ | Desktops |

**Pattern:** Design mobile-first, add responsive prefixes to override. Never write desktop-only styles without a mobile fallback.

---

## Component Patterns

### Buttons

```tsx
// Primary
<button className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed">
  Save changes
</button>

// Secondary
<button className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-500">
  Cancel
</button>

// Destructive
<button className="inline-flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500">
  Delete
</button>
```

### Inputs

```tsx
<div className="flex flex-col gap-1.5">
  <label htmlFor="email" className="text-sm font-medium text-zinc-700">
    Email
  </label>
  <input
    id="email"
    type="email"
    className="block w-full rounded-md border border-zinc-300 px-3 py-2 text-sm placeholder:text-zinc-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:bg-zinc-50 disabled:text-zinc-500"
  />
  <p className="text-xs text-zinc-500">Helper text here</p>
</div>
```

### Cards

```tsx
<div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
  {/* content */}
</div>
```

### Badges / Pills

```tsx
// Neutral
<span className="inline-flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
  Draft
</span>

// Success
<span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
  Active
</span>

// Warning
<span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
  Pending
</span>

// Danger
<span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-700">
  Suspended
</span>
```

---

## State Patterns

Always handle all three states in any data-fetching component:

### Loading

Use `<LoadingSpinner>` from `@/components/shared/LoadingSpinner`:

```tsx
if (loading) return <LoadingSpinner size="md" />
```

For full-page loads: `<FullPageSpinner />`

### Error

Use `<ErrorBoundary>` from `@/components/shared/ErrorBoundary` to wrap route subtrees.
For inline errors, show a plain message:

```tsx
if (error) return (
  <p className="text-sm text-red-600">{error.message ?? 'Something went wrong.'}</p>
)
```

### Empty

Use `<EmptyState>` from `@/components/shared/EmptyState`:

```tsx
if (!data.length) return (
  <EmptyState
    icon={<UsersIcon className="size-8 text-zinc-400" />}
    title="No users yet"
    description="Users will appear here once they sign up."
  />
)
```

---

## Icons

Use `lucide-react`. Import named icons directly:

```tsx
import { PlusIcon, TrashIcon, PencilIcon } from 'lucide-react'

// Sizing: always use Tailwind size-* classes
<PlusIcon className="size-4" />   // 16px — inline with text
<PlusIcon className="size-5" />   // 20px — standalone in buttons
<PlusIcon className="size-6" />   // 24px — feature icons
<PlusIcon className="size-8" />   // 32px — empty state icons
```

Never use `width` and `height` props — use `className="size-*"` only.

---

## Forms

All forms use `react-hook-form` + `zod`. The pattern:

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
})
type FormValues = z.infer<typeof schema>

export function MyForm() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(values: FormValues) {
    const result = await myAction(values)
    if (!result.success) {
      toast.error(result.error ?? 'Something went wrong')
      return
    }
    toast.success('Saved!')
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="name" className="text-sm font-medium text-zinc-700">Name</label>
        <input id="name" {...register('name')} className="..." />
        {errors.name && <p className="text-xs text-red-600">{errors.name.message}</p>}
      </div>
      <button type="submit" disabled={isSubmitting} className="...">
        {isSubmitting ? 'Saving...' : 'Save'}
      </button>
    </form>
  )
}
```

---

## Notifications (Toast)

Use `sonner` (`toast` from `sonner`) for all user-facing feedback. The `<Toaster>` is mounted in `src/providers/index.tsx`.

```tsx
import { toast } from 'sonner'

toast.success('Profile updated')
toast.error('Failed to save changes')
toast.loading('Uploading...')
toast.dismiss()
```

Never use `alert()`, `confirm()`, or custom modal toasts.

---

## Accessibility

- All interactive elements must be keyboard accessible (`tabIndex`, `focus-visible:` styles)
- Use semantic HTML: `<button>`, `<a>`, `<nav>`, `<main>`, `<section>`, `<header>`
- Never use `<div onClick>` for interactive elements — use `<button>` or `<a>`
- Images must have `alt` text; decorative images get `alt=""`
- Form inputs must have associated `<label htmlFor="id">`
- Icon-only buttons must have `aria-label`

```tsx
// Icon button with label
<button aria-label="Delete user" className="...">
  <TrashIcon className="size-4" />
</button>
```

---

## Design Import with Stitch MCP

When the project uses Google Stitch for design handoff:

1. "Fetch the design tokens from my Stitch project" — imports colors, spacing, typography as CSS variables into `globals.css`
2. "Fetch the screen code for the [ScreenName] screen" — generates a component implementation from the Stitch design
3. Always review generated code against the conventions in this file before committing

Set `STITCH_API_KEY` in `.env` to enable the Stitch MCP server.

---

## What to Avoid

- No CSS-in-JS (styled-components, emotion, CSS modules)
- No `style=` props except for truly dynamic values (e.g. computed widths)
- No arbitrary Tailwind values (`w-[347px]`) unless from a design spec
- No custom color names that bypass the design token system
- No third-party component libraries (MUI, Ant Design, Chakra) — use raw Tailwind
- shadcn/ui components may be added per-project — if added, components live in `src/components/ui/` and must not be edited directly
