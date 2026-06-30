# Decisions

## Router-agnostic over Next.js-first

Next.js has the largest React canary surface area and ships `experimental.viewTransition` — it's the obvious first target. But a Next.js-specific library would serve roughly 30% of the React ecosystem and would require a rewrite as TanStack Router, Expo Router, and others stabilize their View Transition support.

The router-agnostic design has one real cost: users call `useNavigate()` from their router and pass the result to `TransitionProvider`. That's one setup line. The payoff: identical behavior with React Router, TanStack Router, Next.js App Router, or any history-based router. Next.js examples are first-class — the `with-nextjs` example shows the `experimental.viewTransition` flag and the `useRouter` wiring — but the core imports nothing from Next.js.

## addTransitionType over view-transition-name classes as the direction signal

The obvious alternative is a CSS class on `<body>`: `.navigating-forward`, `.navigating-back`. Most pre-React-canary demos use this pattern.

Problems with the class approach:
- **Race condition.** The class must be set before the browser takes the "before" snapshot and removed before the animation starts. Timing this manually is fragile and breaks under slow renders.
- **DOM mutation from React.** Setting `document.body.className` is a side effect that React doesn't know about, can't batch, and can't roll back.
- **CSS specificity leaks.** A body class affects every `::view-transition-*` rule on the page, not just the active navigation.

`addTransitionType()` (React canary) was designed for exactly this use case. The type is scoped to the transition instance, not the document. `::view-transition-type(slide-forward)` is transient — the browser cleans it up automatically when the transition ends. No manual lifecycle, no race conditions, no DOM mutations outside React's control.

The tradeoff: requires react@canary or Next.js 15.2+. Older setups get instant navigation with no directional animation. That degradation is correct behavior, not a bug.

## Built-in transition types — minimal keyframes, overridable

The library ships nine built-in transition types: `slide` (direction-aware), `fade`, `zoom`, `slide-up`, `slide-down`, `flip`, `blur`, `reveal`, `rotate`, and the structure-only `morph`. A tenth type, `none`, skips animation entirely.

This set was chosen to cover the most common SPA navigation patterns out of the box so teams don't write boilerplate for a fade or a slide. The guiding constraints:

1. **Keyframes are minimal by design.** `slide` translates 100% and stops. `fade` crosses opacity. There are no spring curves, no choreographed staggers, no opinionated easing beyond the `ease-in-out` default. Every keyframe is easily overridden with ten lines of CSS.
2. **Timing is a CSS variable, not a hard-coded value.** `--vtr-duration` and `--vtr-easing` are overridable at root scope or per-navigation via the `duration`/`easing` props. The library never hard-codes `300ms` in a keyframe — only in the CSS variable default.
3. **`morph` ships no keyframes.** It's a structural type: the consumer sets matching `view-transition-name` values on corresponding elements across routes and the browser morphs them. There is nothing for this library to animate.

Teams that want spring curves, directional opacity fades, or gesture-matched easing write their own `@keyframes` and target the existing `::view-transition-type()` selectors. The built-ins are a starting point, not a ceiling.

## HOC over mandatory JSX wrapping for named elements

The alternative: every call site wraps its component manually.

```jsx
// Alternative: noisy at scale
<ViewTransition name="card">
  <Card />
</ViewTransition>
```

This puts the `view-transition-name` knowledge in the consumer, not the component. At scale (20+ named elements) it creates visual noise that obscures the actual render tree and invites accidental double-wrapping (see the constraint on nested `<ViewTransition>`).

`withViewTransition(Card, 'card')` co-locates the transition identity with the component definition. Auto-generated names from `displayName` eliminate the boilerplate in the common case. The only time an explicit name is needed is in lists where multiple instances coexist in the same frame — there, users derive a stable name from a key: `withViewTransition(Card, \`card-${id}\`)`.

The HOC is seven lines of wrapper code. There is no hidden behavior.

## history.state.idx over window.navigation API

The Navigation API (`window.navigation.currentEntry.index`) would simplify direction tracking and is the long-term correct answer. It has no Firefox support and partial Safari support as of mid-2025.

`history.state.idx` is a convention established by React Router and adopted by TanStack Router. It provides a numeric sequence counter: the current index minus the previous index gives direction AND magnitude. The Navigation API provides direction but requires more ceremony for the same result.

The deeper reason to prefer the idx convention: magnitude matters. A `|delta| > 1` means the user skipped entries (e.g. session restore, deep link). Future features — swipe gesture prediction, animation skip for large jumps — need that information.

Detection is duck-typed: if `history.state?.idx` is absent (plain browser nav, non-React-Router setup), direction falls back to `'replace'`. The library degrades gracefully rather than throwing.

## Safari/Firefox types degradation

`addTransitionType()` annotates the active `::view-transition-type()` CSS pseudo-class. Safari 18.2 introduced View Transitions without type support. Firefox 144 added same-document transitions, also without types.

The library calls `addTransitionType` unconditionally. On browsers that don't support it, the function is a no-op, the CSS `::view-transition-type()` selectors match nothing, and the browser's default crossfade fires. No broken layout, no console errors, no conditional branches in user code.

Reliable detection of type support is not straightforward. `CSS.supports('@view-transition', 'auto')` tests the property, not the types feature. The `ViewTransition.types` iterable (on the object passed to `document.startViewTransition`'s callback) would work, but React controls that call and doesn't expose the object. Duck-typing `addTransitionType` itself is the pragmatic approach: if it's defined, use it; if not, skip it.

Directional animations are a progressive enhancement. Ship them for Chrome/Edge now; Safari and Firefox will catch up.
