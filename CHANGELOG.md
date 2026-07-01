# Changelog

All notable changes to this project will be documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added

- JS-level `prefers-reduced-motion` check in `TransitionLink` and `useTransitionNavigate` — `startViewTransition` is now skipped entirely (not just visually null-animated via CSS) when the user has the OS-level preference set.
- Dev-mode console warnings (stripped in production builds) for two previously-silent footguns: navigating with no `navigate`/`renderLink` configured (falls back to a full-page `window.location` reload), and mounting multiple `withViewTransition`-wrapped components with the same `view-transition-name`.

### Fixed

- Removed stale compiled `.js` files that were accidentally committed alongside their `.ts`/`.tsx` sources in `src/`, and `poc/` Playwright build artifacts (`playwright-report/`, `test-results/`) that were tracked in git. All are now gitignored.

### Internal

- Added a CI workflow (`typecheck` + `test:coverage` + `build`) that previously didn't exist alongside the demo-deploy workflow.

---

## [0.1.0] — 2026-06-30

Initial public release.

### Added

- **`<TransitionProvider>`** — context root that tracks navigation direction via `history.state.idx` delta and registers a capture-phase `popstate` listener for back/forward button animations.
- **`<TransitionLink>`** — drop-in `<a>` replacement that calls `addTransitionType` inside `startTransition` before navigating. Supports `renderLink` for rendering the host router's link element visually. Modifier keys, middle-click, and non-`_self` targets fall through to browser default behavior.
- **`<TransitionView>`** — wraps the route outlet in `<ViewTransition name="vtr-page">` so `document.startViewTransition` fires. Falls back to a plain fragment when React does not expose `ViewTransition` (React 19 stable).
- **`withViewTransition(Component, name?)`** — HOC that wraps a component in `<ViewTransition>`. Accepts a static name string or a function `(props) => string` for list items. Falls back to `Component.displayName`, `Component.name`, or `'view'` when no name is given.
- **`useTransitionContext()`** — returns `{ direction, transitionType, isPending }` for driving exit animations, loading states, and interaction guards.
- **`useTransitionNavigate()`** — imperative navigation hook with the same transition semantics as `<TransitionLink>`. Accepts a path string or a numeric delta for `history.go()`.
- **Nine built-in transition types** — `slide` (direction-aware), `fade`, `zoom`, `slide-up`, `slide-down`, `flip`, `blur`, `reveal`, `rotate`. `morph` and `none` are structural types with no bundled keyframes.
- **`view-transition-router/styles`** stylesheet — minimal overridable keyframes for all nine animated types. `--vtr-duration` and `--vtr-easing` CSS custom properties for global timing control.
- **`duration` and `easing` overrides** — per-navigation timing control on `<TransitionLink>`, `useTransitionNavigate`, and global defaults via `TransitionConfig`.
- **SSR/RSC safety** — all `document` and `window` access is gated behind `typeof document !== 'undefined'`. `<TransitionProvider>` and `<TransitionLink>` are marked `'use client'` for Next.js App Router.
- **Graceful degradation** — browsers without View Transitions API get instant navigation. Browsers with View Transitions but without `addTransitionType` (Safari 18.2, Firefox 144) get the browser default crossfade.
- **Router-agnostic** — works with React Router v6 (data router API), TanStack Router, Next.js App Router, or any history-based router that exposes a `navigate` function.
