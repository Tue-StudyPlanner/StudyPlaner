# Source Structure (`src/`)

A quick overview of every folder and file in the `src/` directory.

---

### `assets/`
Static files such as images, icons, and fonts.  
Anything imported directly into components (e.g. a logo) goes here.

---

### `features/`
The core of the application. Each feature of the app gets its own subfolder containing everything it needs — components, hooks, API calls, and types.

> **Rule:** Other features never reach inside a feature folder directly.  
> Always import via the feature's `index.ts`:
> ```ts
> // ✅ Correct
> import { useAuth } from '@/features/auth'
>
> // ❌ Wrong
> import { useAuth } from '@/features/auth/hooks/useAuth'
> ```

---

### `shared/`
Reusable building blocks with no feature-specific logic.  
If a component or function is useful across multiple features, it lives here.

#### `shared/components/`
Generic UI components — `Button`, `Modal`, `Spinner`, `Input`, etc.  
No business logic, no API calls.

#### `shared/hooks/`
Custom hooks that are not tied to any one feature.  
Examples: `useDebounce.ts`, `useWindowSize.ts`

#### `shared/utils/`
Pure helper functions.  
Examples: `formatDate.ts`

---

### `App.tsx`
The root component. Defines the routing structure of the application.

---

### `index.css`
The single global stylesheet. Contains only:
- The Tailwind import (`@import "tailwindcss"`)
- Global base styles (font, body background)
- CSS theme variables (`@theme { ... }`)

Component-level styles are written directly as Tailwind classes — no separate `.css` files per component.

---

### `main.tsx`
The entry point of the application. Mounts the `App` component into the HTML root element. You will rarely need to edit this file.
