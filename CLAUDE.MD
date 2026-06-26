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

startTransition and the CSS layer can respond with ::view-transition-type(slide-left).

This library wraps that in a declarative API so you never call it by hand.



Layer model



\[CSS layer]        ::view-transition-type(\*)  ← user customizes this

\[Library layer]    <TransitionLink>  useTransitionContext  TransitionProvider

\[React layer]      <ViewTransition>  addTransitionType  startTransition

\[Browser layer]    document.startViewTransition()  ::view-transition-old/new



Key components



<TransitionProvider>

Context root. Wraps the router outlet (or children). Tracks navigation

direction via history index delta. Never touches the DOM directly.



<TransitionLink to="..." transition="slide" />

Thin wrapper over whatever Link primitive the user's router exposes (pluggable

via renderLink prop or context config). Calls addTransitionType(direction)

inside startTransition before navigating. Falls back to normal navigation

on unsupported browsers via document.startViewTransition feature detect.



useTransitionContext()

Returns { direction, transitionType, isPending }. Lets any component

downstream react to transition state — useful for exit animations or disabling

interactions mid-flight.



withViewTransition(Component, name?)

HOC that wraps a component in <ViewTransition name={name}>. Auto-generates

stable names from component displayName if not provided. Exists because

wrapping every JSX node manually is noise.



Direction logic



history.state.idx (current) - history.state.idx (previous)

&#x20; > 0  → "forward"

&#x20; < 0  → "backward"

&#x20; = 0  → "replace" (tabs, modals — no directional slide)



Stored in a ref, not state — direction computation must not trigger a render.



Transition type → CSS contract



The library ships three built-in types and a clear extension point:



TypeaddTransitionType callCSS selector to overrideslideslide-forward/slide-back::view-transition-type(slide-\*)fadefade::view-transition-type(fade)morphconsumer sets view-transition-name on both elementsstandard VT name matchingnoneskips startViewTransition—



Users override CSS vars --vtr-duration, --vtr-easing for global tuning.

Per-transition CSS is in a thin optional stylesheet (view-transition-router/styles).



SSR / RSC safety



document.startViewTransition and addTransitionType are client-only.

All browser access is gated behind typeof document !== 'undefined'.

<TransitionProvider> and <TransitionLink> are client components in

Next.js App Router ('use client'). <ViewTransition> from React handles

Suspense boundaries natively — this library doesn't interfere with streaming.





What this is NOT





Not a router. Zero routing logic. Works with React Router, TanStack

Router, Next.js App Router, or anything that exposes history + a Link.

Not an animation library. No keyframes shipped by default beyond

the three built-ins. CSS is the animation layer.

Not a polyfill. Browsers without View Transitions API get instant

navigation. That's the correct degradation.

Not a wrapper for the old flushSync pattern. That's dead — this

library assumes react@canary / React 19+ with native VT support.







Browser support contract



BrowserSinceNotesChrome/Edge111+Full support including typesSafari18.2+No VT types in initial releaseFirefox144+Same-doc transitions; no types yetOlder—Instant navigation, no animation



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







File structure



src/

&#x20; components/

&#x20;   TransitionProvider.tsx   # context + direction tracking

&#x20;   TransitionLink.tsx       # pluggable link with transition intent

&#x20;   withViewTransition.tsx   # HOC wrapper

&#x20; hooks/

&#x20;   useTransitionContext.ts  # direction, type, isPending

&#x20;   useNavigationDirection.ts # raw history delta logic, extracted for testing

&#x20; styles/

&#x20;   base.css                 # ::view-transition-type(\*) built-in keyframes

&#x20;   variables.css            # --vtr-duration, --vtr-easing

&#x20; types.ts                   # TransitionType, Direction, TransitionConfig

&#x20; index.ts                   # public API surface



examples/

&#x20; with-react-router/

&#x20; with-tanstack-router/

&#x20; with-nextjs/               # shows experimental.viewTransition flag





Public API surface (what ships in index.ts)



ts// Components

export { TransitionProvider }   // required root

export { TransitionLink }       // <Link> replacement

export { withViewTransition }   // HOC



// Hooks

export { useTransitionContext }



// Types

export type { TransitionType, Direction, TransitionLinkProps, TransitionConfig }



Nothing else. Internal helpers are not exported.





What makes a good README for this project



Must-have sections (in order):





The problem — one paragraph, concrete. "Every app re-implements direction

detection. Every team writes the same addTransitionType(forward/back) logic."

Quick start — copy-paste working code in ≤15 lines

Router adapter examples — React Router, TanStack, Next.js (people skim to their router)

CSS customization — show the ::view-transition-type() override pattern

Browser support table (copy from above)

Architecture / decisions — 200 words max, link to DECISIONS.md for depth







DECISIONS.md topics to write





Why router-agnostic over Next.js-first (wider TAM, honest DX story)

Why addTransitionType over view-transition-name classes as the direction signal

Why no keyframe defaults beyond three built-ins (avoid opinionated animation)

Why HOC over mandatory JSX wrapping for named elements

Why history.state.idx over window.navigation API (compat + predictability)

The Safari/Firefox types degradation decision

