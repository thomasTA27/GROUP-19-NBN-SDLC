---
description: Add a new OAuth provider to Firebase Authentication — updates Firebase config, creates a sign-in button component, and adds it to the login/register pages. Use when adding Google, GitHub, Apple, or other OAuth sign-in.
argument-hint: "[provider e.g. github|apple|microsoft]"
---

# Skill: /add-auth-provider

Add a new OAuth provider to the Firebase authentication system.

## Supported providers

| Provider | Class | Scope examples |
|---------|-------|----------------|
| Google | `GoogleAuthProvider` | already included |
| GitHub | `GithubAuthProvider` | `repo`, `user:email` |
| Microsoft | `OAuthProvider('microsoft.com')` | `User.Read` |
| Apple | `OAuthProvider('apple.com')` | `email`, `name` |
| Facebook | `FacebookAuthProvider` | `email`, `public_profile` |
| Twitter/X | `TwitterAuthProvider` | _(no scopes)_ |

## Step 1 — Prerequisites (user must do this manually)

Instruct the user to:
1. Open **Firebase Console → Authentication → Sign-in method**
2. Click **Add new provider** and select the provider
3. Copy the **Client ID** and **Client Secret** into the Firebase Console form
4. For GitHub: register an OAuth App at github.com/settings/developers
5. For Apple: requires a paid Apple Developer account

## Step 2 — Add sign-in function to `frontend/src/lib/firebase/auth.ts`

```typescript
import { GithubAuthProvider, signInWithPopup } from 'firebase/auth'
import { getClientAuth } from './client'

export async function signInWithGithub() {
  const provider = new GithubAuthProvider()
  // provider.addScope('user:email')
  const result = await signInWithPopup(getClientAuth(), provider)
  return result.user
}
```

Match the existing helpers in that file (`signInWithGoogle` uses the same `getClientAuth()` lazy pattern).

## Step 3 — Create sign-in button component

Create `frontend/src/components/auth/{Provider}SignInButton.tsx`:
```typescript
'use client'

import { signInWith{Provider} } from '@/lib/firebase/auth'

interface {Provider}SignInButtonProps {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

export function {Provider}SignInButton({ onSuccess, onError }: {Provider}SignInButtonProps) {
  const handleClick = async () => {
    try {
      await signInWith{Provider}()
      onSuccess?.()
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error('Sign-in failed'))
    }
  }

  return (
    <button type="button" onClick={handleClick} className="...">
      Continue with {Provider}
    </button>
  )
}
```

## Step 4 — Add button to login and register pages

Import and render `<{Provider}SignInButton>` in:
- `frontend/src/app/(auth)/auth/signin/page.tsx`
- `frontend/src/app/(auth)/auth/signup/page.tsx`

## Step 5 — Update CLAUDE.md

Add the new provider to the "Auth Providers" list.

## Notes

- This boilerplate uses `signInWithPopup`. For mobile-heavy apps, consider `signInWithRedirect` + `getRedirectResult`
- For Microsoft, configure tenant if restricting to org accounts: `provider.setCustomParameters({ tenant: 'your-tenant-id' })`
- Apple Sign-In requires the domain to be verified in Apple Developer Console
