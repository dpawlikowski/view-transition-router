# view-transition-router

Direction-aware React View Transitions, router-agnostic.

```
npm install view-transition-router
```

> **Requires** `react@experimental` or `react@canary` (React 19 stable does not yet ship `addTransitionType` or `<ViewTransition>`). Next.js 15.2+ with `experimental.viewTransition: true` also works — it bundles canary React internally.

---

## The problem

Every app that adds View Transitions ends up writing the same boilerplate: detect whether the user went forward or backward, call `addTransitionType('slide-forward')` or `addTransitionType('slide-back')` inside `startTransition`, then wire up a `popstate` listener for the back button. It's thirty lines of infrastructure that has nothing to do with your product. `view-transition-router` ships that logic once, exposes it as a declarative API, and gets out of the way.

---

## Quick start

```tsx
import { TransitionProvider, TransitionLink, TransitionView } from 'view-transition-router';
import 'view-transition-router/styles';

function App() {
  const navigate = useNavigate(); // from your router

  return (
    <TransitionProvider config={{ navigate }}>
      <nav>
        <TransitionLink to="/" transition="slide">Home</TransitionLink>
        <TransitionLink to="/about" transition="slide">About</TransitionLink>
      </nav>
      <TransitionView>
        <Routes /> {/* your router outlet */}
      </TransitionView>
    </TransitionProvider>
  );
}
```

That's it. Forward navigation slides right, back button slides left, `prefers-reduced-motion` is respected automatically.

---

## Router adapters

### React Router v6

Use the **data router API** (`createBrowserRouter` + `RouterProvider`). This is required for browser back/forward animations — `RouterProvider` wraps every navigation (including `popstate`) in `React.startTransition`, which triggers `<ViewTransition>`. The legacy `BrowserRouter` uses synchronous dispatch and back/forward buttons will not animate.

```tsx
// main.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './App';
import { Home } from './pages/Home';
import { About } from './pages/About';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
```

```tsx
// App.tsx
import { Outlet, useNavigate } from 'react-router-dom';
import { TransitionProvider, TransitionLink, TransitionView } from 'view-transition-router';

export function App() {
  const navigate = useNavigate();
  return (
    <TransitionProvider config={{ navigate }}>
      <nav>
        <TransitionLink to="/" transition="slide">Home</TransitionLink>
        <TransitionLink to="/about" transition="slide">About</TransitionLink>
      </nav>
      <TransitionView>
        <Outlet />
      </TransitionView>
    </TransitionProvider>
  );
}
```

### TanStack Router

```tsx
import { useRouter, Outlet } from '@tanstack/react-router';
import { TransitionProvider, TransitionLink, TransitionView } from 'view-transition-router';
import type { NavigateOptions } from 'view-transition-router';

function RootComponent() {
  const router = useRouter();

  function navigate(to: string, opts?: NavigateOptions) {
    router.navigate({ to, replace: opts?.replace });
  }

  return (
    <TransitionProvider config={{ navigate }}>
      <nav>
        <TransitionLink to="/">Home</TransitionLink>
        <TransitionLink to="/about">About</TransitionLink>
      </nav>
      <TransitionView>
        <Outlet />
      </TransitionView>
    </TransitionProvider>
  );
}
```

TanStack Router's `navigate` API takes an object — wrap it to match the `(to, opts?) => void` signature.

### Next.js App Router

```ts
// next.config.ts
const nextConfig = {
  experimental: { viewTransition: true },
};
```

```tsx
// app/providers.tsx
'use client';
import { useRouter } from 'next/navigation';
import { TransitionProvider } from 'view-transition-router';

export function Providers({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <TransitionProvider config={{ navigate: (to) => router.push(to) }}>
      {children}
    </TransitionProvider>
  );
}
```

```tsx
// app/layout.tsx  (Server Component)
import { Providers } from './providers';
import { TransitionView } from 'view-transition-router';
import 'view-transition-router/styles';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <TransitionView>{children}</TransitionView>
        </Providers>
      </body>
    </html>
  );
}
```

```tsx
// app/page.tsx  (Server Component — TransitionLink is 'use client' internally)
import { TransitionLink } from 'view-transition-router';

export default function Home() {
  return <TransitionLink to="/about" transition="slide">About</TransitionLink>;
}
```

---

## Transition types

All built-in types ship with keyframes in the included stylesheet.

| Type | Effect | CSS token(s) |
|---|---|---|
| `slide` | Horizontal push, direction-aware | `slide-forward` / `slide-back` |
| `fade` | Cross-dissolve opacity | `fade` |
| `zoom` | Scale in/out with opacity | `zoom` |
| `slide-up` | New page enters from bottom, old exits upward | `slide-up` |
| `slide-down` | New page enters from top, old exits downward | `slide-down` |
| `flip` | Sequential 3D Y-axis card flip | `flip` |
| `blur` | Blur + opacity cross-fade | `blur` |
| `reveal` | Clip-path wipe sweeping in from the right | `reveal` |
| `rotate` | Subtle rotation + scale + opacity | `rotate` |
| `morph` | Shared-element — set matching `view-transition-name` on both pages | `morph` |
| `none` | Instant switch, no animation | — |

```tsx
<TransitionLink to="/details" transition="zoom">View details</TransitionLink>

const navigate = useTransitionNavigate();
navigate('/gallery', { transition: 'reveal' });
```

---

## Duration & easing

Override `--vtr-duration` and `--vtr-easing` per-navigation or globally.

**Per-navigation** (link):
```tsx
<TransitionLink to="/about" transition="slide" duration={600} easing="ease-out">
  About
</TransitionLink>
```

**Per-navigation** (hook):
```tsx
const navigate = useTransitionNavigate();
navigate('/about', { transition: 'flip', duration: 800, easing: 'linear' });
```

**Global default** (provider config):
```tsx
<TransitionProvider config={{ navigate, defaultDuration: 500, defaultEasing: 'ease-in-out' }}>
```

The `easing` prop accepts any CSS timing function: `'ease'`, `'ease-in'`, `'ease-out'`, `'ease-in-out'`, `'linear'`, or a `cubic-bezier(...)` string.

---

## CSS customization

Import the built-in stylesheet to get all keyframes out of the box:

```ts
import 'view-transition-router/styles';
```

### Tune timing globally

```css
:root {
  --vtr-duration: 400ms;
  --vtr-easing: cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Override keyframes

The built-ins are intentionally minimal. Replace them entirely:

```css
@keyframes vtr-slide-out-left {
  to { translate: -30% 0; opacity: 0; }
}

@keyframes vtr-slide-in-right {
  from { translate: 30% 0; opacity: 0; }
}
```

### Add custom transition types

`TransitionLink` accepts any string for `transition`. Define the CSS to match:

```tsx
<TransitionLink to="/modal" transition="my-zoom">Open</TransitionLink>
```

```css
:root:active-view-transition-type(my-zoom) {
  &::view-transition-old(vtr-page) {
    animation: my-zoom-out 250ms ease both;
  }
  &::view-transition-new(vtr-page) {
    animation: my-zoom-in 250ms ease both;
  }
}

@keyframes my-zoom-out { to { scale: 0.95; opacity: 0; } }
@keyframes my-zoom-in  { from { scale: 1.05; opacity: 0; } }
```

### Shared element morph

Name the same element identically in both routes — the browser morphs between them:

```tsx
// Both routes render this component — the browser matches by name and morphs.
const FeaturedCard = withViewTransition(Card, 'featured-card');
```

For lists, pass a function so each item gets a unique name. Duplicate names on the same page are silently skipped by the browser:

```tsx
const ProductCard = withViewTransition(Card, (props) => `product-${props.id}`);

// List page and detail page both render ProductCard with the same id → morph.
items.map(item => <ProductCard key={item.id} {...item} />)
```

---

## API

### `<TransitionProvider config?>`

Required root. Wraps your router outlet. Provides transition context to all descendants.

```ts
interface TransitionConfig {
  navigate?: (to: string, options?: NavigateOptions) => void;
  defaultTransition?: TransitionType;  // default: 'slide'
  defaultDuration?: number;            // override --vtr-duration (ms) for all navigations
  defaultEasing?: TransitionEasing;    // override --vtr-easing for all navigations
  renderLink?: (props: RenderLinkProps) => React.ReactElement;
}
```

### `<TransitionLink to transition? duration? easing? replace? navigate? renderLink?>`

Replaces your router's `<Link>`. Calls `addTransitionType` inside `startTransition` before navigating. Ctrl/Cmd/Shift/middle-click fall through to browser default behavior.

```ts
interface TransitionLinkProps {
  to: string;
  transition?: TransitionType;
  duration?: number;            // override --vtr-duration for this link (ms)
  easing?: TransitionEasing;   // override --vtr-easing for this link
  replace?: boolean;
  target?: string;              // non-'_self' targets fall through to browser
  navigate?: (to: string, options?: NavigateOptions) => void;
  renderLink?: (props: RenderLinkProps) => React.ReactElement;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}
```

Use `renderLink` to render your router's link element visually (for correct `aria`, hover URL preview, etc.) while keeping transition logic in this library:

```tsx
<TransitionLink
  to="/about"
  renderLink={({ to, children, onClick }) => (
    <RouterLink to={to} onClick={onClick}>{children}</RouterLink>
  )}
/>
```

### `<TransitionView name?>`

Wraps your route outlet in `<ViewTransition>`. Required for `document.startViewTransition` to fire. Default name is `vtr-page` (exported as `DEFAULT_OUTLET_NAME`) — matches the built-in CSS selectors. Change the name only if you also update your CSS rules to match.

`TransitionLink` can live anywhere in the tree — inside or outside `TransitionView`. Links outside (e.g. a nav bar) stay fixed while page content animates. Links inside animate together with the page they're on:

```tsx
// Nav bar stays put — only the page content slides.
<TransitionProvider config={{ navigate }}>
  <nav>
    <TransitionLink to="/">Home</TransitionLink>
  </nav>
  <TransitionView>
    <Routes />
  </TransitionView>
</TransitionProvider>
```

### `withViewTransition(Component, name?)`

HOC that wraps a component in `<ViewTransition name={name}>`. Auto-generates a stable name from `Component.displayName` if not provided.

```ts
withViewTransition(Component, name?: string | ((props: P) => string))
```

**One instance per name per frame.** Two mounted components with the same name cause a browser error. For lists, pass a function so each item gets a unique name derived from its data:

```tsx
// Static — one instance per page.
const HeroImage = withViewTransition(Image, 'hero');

// Dynamic — list items each get a unique name.
const ProductCard = withViewTransition(Card, (props) => `product-${props.id}`);

// Usage — no extra wiring needed.
products.map(p => <ProductCard key={p.id} {...p} />)
```

### `useTransitionContext()`

```ts
const { direction, transitionType, isPending } = useTransitionContext();
// direction:      'forward' | 'backward' | 'replace'
// transitionType: 'slide' | 'fade' | 'morph' | 'none' | null
// isPending:      boolean — true while the transition is in flight
```

Useful for disabling interactions mid-flight, showing loading states, or driving exit animations.

### `useTransitionNavigate()`

Imperative navigation with transition — same semantics as `<TransitionLink>` but callable from event handlers.

```ts
const navigate = useTransitionNavigate();

// string path
navigate('/dashboard', { transition: 'fade' });
navigate('/settings', { transition: 'slide', duration: 400, easing: 'ease-in' });
navigate('/replace',  { transition: 'fade', replace: true });

// delta (back/forward in history)
navigate(-1, { transition: 'slide' }); // direction auto-detected as 'backward'
navigate(1,  { transition: 'slide' }); // 'forward'
```

### Types

```ts
// User-facing transition intent — what you pass to transition= props.
type TransitionType =
  | 'slide' | 'fade' | 'zoom' | 'slide-up' | 'slide-down'
  | 'flip' | 'blur' | 'reveal' | 'rotate' | 'morph' | 'none'
  | (string & {});

// CSS easing function.
type TransitionEasing = 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'linear' | (string & {});

// CSS token passed to addTransitionType — 'slide' expands to 'slide-forward'/'slide-back'.
type TransitionToken = 'slide-forward' | 'slide-back' | 'fade' | 'zoom' | 'flip' | ... | (string & {});

type Direction = 'forward' | 'backward' | 'replace';
```

---

## Browser support

| Browser | Since | Notes |
|---|---|---|
| Chrome / Edge | 111+ | Full support including typed transitions |
| Safari | 18.2+ | View Transitions yes, `addTransitionType` not yet — falls back to crossfade |
| Firefox | 144+ | Same-document transitions yes, no types yet — falls back to crossfade |
| Older | — | Instant navigation, no animation |

Directional animations (`slide-forward` / `slide-back`) are a progressive enhancement. Browsers that don't support `addTransitionType` still navigate — they just crossfade.

---

## Architecture

The browser sees two snapshots and interpolates. React reconciles the component tree. The gap between them is **intent**: was this navigation forward, backward, or a lateral replace? `addTransitionType()` (React canary) is the bridge — call it inside `startTransition` and the CSS layer can respond with `::view-transition-type(slide-forward)`.

```
[CSS layer]      ::view-transition-type(*)           ← you customize this
[Library layer]  TransitionProvider · TransitionLink · TransitionView
[React layer]    <ViewTransition> · addTransitionType · startTransition
[Browser layer]  document.startViewTransition()
```

Direction is computed from `history.state.idx` delta — a convention set by React Router and adopted by TanStack Router. Positive delta = forward, negative = backward, zero = replace. The back button is handled via a `popstate` listener (registered in capture phase, before the router) that calls `addTransitionType` inside `startTransition` — so browser back/forward gets the same directional animations as programmatic navigation.

For the detailed rationale behind each decision (router-agnostic design, why `addTransitionType` over body classes, Safari degradation strategy, etc.) see [DECISIONS.md](./DECISIONS.md).
