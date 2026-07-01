What this is

A router-agnostic React library that makes View Transitions actually usable:
direction-aware animations, typed transition names, and clean DX — without
locking users into Next.js or any specific router.

React's <ViewTransition> (in react@canary since Oct 2025, Next.js via
experimental.viewTransition) gives you the primitive. This library gives
you the pattern layer on top: directional context, transition type
propagation, and a composable <Link> that knows where you're going.

Architecture

Core insight

The browser knows two snapshots (before/after). React reconciles the tree.
The gap is intent: was this navigation forward, backward, or lateral?
addTransitionType() (React canary) is the hook — call it inside
startTransition and the CSS layer can respond with ::view-transition-type(slide-forward).
This library wraps that in a declarative API so you never call it by hand.

Layer model

[CSS layer]        ::view-transition-type(*)  ← user customizes this
[Library layer]    <TransitionLink>  <TransitionView>  useTransitionContext  useTransitionNavigate  TransitionProvider
[React layer]      <ViewTransition>  addTransitionType  startTransition
[Browser layer]    document.startViewTransition()  ::view-transition-old/new

Key components

<TransitionProvider>
Context root. Wraps the router outlet (or children). Tracks navigation
direction via history index delta. Accepts `defaultTransition`,
`defaultDuration`, `defaultEasing`, `navigate`, `renderLink` as config for
the whole subtree. Never touches the DOM directly.

<TransitionLink to="..." transition="slide" />
Thin wrapper over whatever Link primitive the user's router exposes (pluggable
via `renderLink` prop or provider config). Calls addTransitionType(direction)
inside startTransition before navigating. Accepts per-link `duration`/`easing`
overrides. Falls back to normal navigation on unsupported browsers via
document.startViewTransition feature detect, and to `window.location` if no
`navigate`/`renderLink` is configured (dev-mode console warning fires in that
fallback case).

<TransitionView name?>
Thin wrapper around React's <ViewTransition> with SSR/unsupported-browser
duck-typing so consumers don't need to feature-detect `ViewTransition` from
`react` themselves.

useTransitionContext()
Returns { direction, transitionType, isPending }. Lets any component
downstream react to transition state — useful for exit animations or disabling
interactions mid-flight.

useTransitionNavigate()
Imperative escape hatch equivalent to <TransitionLink> for non-link
navigation (form submit, redirect after async action). Same
transition/duration/easing/replace/state options as TransitionLinkProps.

withViewTransition(Component, name?)
HOC that wraps a component in <ViewTransition name={name}>. Auto-generates
stable names from component displayName if not provided. Exists because
wrapping every JSX node manually is noise. Passing a stable, key-derived
`name` is required when mapping the HOC over a list — otherwise duplicate
`view-transition-name`s cause the browser to silently skip the transition.

Direction logic

history.state.idx (current) - history.state.idx (previous)
  > 0  → "forward"
  < 0  → "backward"
  = 0  → "replace" (tabs, modals — no directional slide)

Stored in a ref, not state — direction computation must not trigger a render.

Transition type → CSS contract

Built-in types, each mapping to an `addTransitionType` token consumed by
`::view-transition-type(...)` in `src/styles/base.css`:

| Type         | addTransitionType token(s)      | Effect                                   |
|--------------|----------------------------------|-------------------------------------------|
| `slide`      | `slide-forward` / `slide-back`  | direction-aware horizontal push           |
| `fade`       | `fade`                           | cross-dissolve opacity                    |
| `zoom`       | `zoom`                           | scale in/out with opacity                 |
| `slide-up`   | `slide-up`                       | new page enters from bottom               |
| `slide-down` | `slide-down`                     | new page enters from top                  |
| `flip`       | `flip`                           | sequential 3D Y-axis flip                 |
| `blur`       | `blur`                           | blur + opacity cross-fade                 |
| `reveal`     | `reveal`                         | clip-path wipe from the right             |
| `rotate`     | `rotate`                         | subtle rotation + scale + opacity         |
| `morph`      | — (no token)                     | consumer sets `view-transition-name` on matching elements; standard VT name matching |
| `none`       | — (skips `startViewTransition`)  | instant switch, no animation              |

Users override CSS vars `--vtr-duration`, `--vtr-easing` for global tuning,
or pass `duration`/`easing` to `TransitionProvider`/`TransitionLink`/
`useTransitionNavigate` for per-scope/per-navigation overrides that are
applied as inline custom properties. `src/styles/base.css` also includes a
`prefers-reduced-motion: reduce` media query that nulls all
`::view-transition-old/new` animation; consumers who need a JS-level kill
switch (e.g. to skip `startViewTransition` entirely) can check
`matchMedia('(prefers-reduced-motion: reduce)')` themselves before rendering
transition-triggering UI.

SSR / RSC safety

document.startViewTransition and addTransitionType are client-only.
All browser access is gated behind typeof document !== 'undefined'.
<TransitionProvider>, <TransitionLink>, and <TransitionView> are client
components in Next.js App Router ('use client'). <ViewTransition> from React
handles Suspense boundaries natively — this library doesn't interfere with
streaming.

What this is NOT

Not a router. Zero routing logic. Works with React Router, TanStack
Router, Next.js App Router, or anything that exposes history + a Link.
Not an animation library. No keyframes shipped by default beyond
the built-in types. CSS is the animation layer.
Not a polyfill. Browsers without View Transitions API get instant
navigation. That's the correct degradation.
Not a wrapper for the old flushSync pattern. That's dead — this
library assumes react@canary / React 19+ with native VT support.

Browser support contract

| Browser     | Since | Notes                              |
|-------------|-------|-------------------------------------|
| Chrome/Edge | 111+  | Full support including types        |
| Safari      | 18.2+ | No VT types in initial release      |
| Firefox     | 144+  | Same-doc transitions; no types yet  |
| Older       | —     | Instant navigation, no animation    |

Safari/Firefox lack addTransitionType as of writing — directional CSS
falls back to fade. Detection via CSS.supports('@view-transition', 'auto')
is unreliable; use duck-typing on ViewTransition.types instead.

Constraints

Requires react@canary or Next.js 15.2+ (which bundles canary internally).
Do not add react@canary as a peerDependency when targeting Next.js —
they bundle it. Use a peerDependencies range that covers both.
<ViewTransition> only fires for async transitions (startTransition,
useDeferredValue, Suspense). Synchronous state updates skip animation
intentionally — don't try to work around this.
Avoid nesting <ViewTransition> wrappers around the same element from two
places (library + user code). The innermost one wins; document this clearly.
view-transition-name must be unique per-frame or the browser skips
the transition silently. withViewTransition auto-generates names but
deduplication in lists requires passing a stable key-derived name.
Never call document.startViewTransition() directly alongside React's
integration. Double-wrapping produces no animation and a console error.
Do not commit compiled output into src/ — `tsup` output belongs only in
`dist/` (gitignored source-adjacent `.js`/`.js.map` files are a build
artifact leak, not source).

File structure

src/
  components/
    TransitionProvider.tsx   # context + direction tracking
    TransitionLink.tsx       # pluggable link with transition intent
    TransitionView.tsx       # thin <ViewTransition> wrapper with SSR duck-typing
    withViewTransition.tsx   # HOC wrapper
  hooks/
    useTransitionContext.ts  # direction, type, isPending
    useTransitionNavigate.ts # imperative navigate with transition options
    useNavigationDirection.ts # raw history delta logic, extracted for testing
  styles/
    base.css                 # ::view-transition-type(*) built-in keyframes + reduced-motion query
    variables.css            # --vtr-duration, --vtr-easing
  constants.ts                # DEFAULT_OUTLET_NAME and other shared constants
  types.ts                    # TransitionType, TransitionToken, Direction, TransitionConfig, etc.
  index.ts                    # public API surface

examples/
  with-react-router/
  with-tanstack-router/
  with-nextjs/               # shows experimental.viewTransition flag

Public API surface (what ships in index.ts)

```ts
// Components
export { TransitionProvider }   // required root
export { TransitionLink }       // <Link> replacement
export { TransitionView }       // thin <ViewTransition> wrapper
export { withViewTransition }   // HOC

// Hooks
export { useTransitionContext }
export { useTransitionNavigate }

// Constants
export { DEFAULT_OUTLET_NAME }

// Types
export type {
  TransitionType, TransitionToken, TransitionEasing, Direction, LinkTarget,
  NavigationPath, TransitionLinkProps, TransitionConfig, NavigateOptions,
  TransitionNavigateOptions, TransitionViewProps,
}
```

Nothing else. Internal helpers are not exported.

What makes a good README for this project

Must-have sections (in order):

The problem — one paragraph, concrete. "Every app re-implements direction
detection. Every team writes the same addTransitionType(forward/back) logic."
Quick start — copy-paste working code in ≤15 lines
Router adapter examples — React Router, TanStack, Next.js (people skim to their router)
Transition types — the built-in type table and how to extend with custom tokens
Duration/easing overrides — provider-level vs. per-navigation
CSS customization — show the ::view-transition-type() override pattern
Browser support table (copy from above)
Architecture / decisions — 200 words max, link to DECISIONS.md for depth

DECISIONS.md topics to write

Why router-agnostic over Next.js-first (wider TAM, honest DX story)
Why addTransitionType over view-transition-name classes as the direction signal
Why nine built-in types instead of only three (breadth of common patterns without becoming an opinionated animation library)
Why HOC over mandatory JSX wrapping for named elements
Why history.state.idx over window.navigation API (compat + predictability)
The Safari/Firefox types degradation decision
