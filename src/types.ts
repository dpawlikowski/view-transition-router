import type {
  CSSProperties,
  MouseEventHandler,
  ReactElement,
  ReactNode,
} from 'react';

/**
 * User-facing transition intent. `'slide'` expands into a directional CSS token
 * at runtime. The `(string & {})` intersection preserves autocomplete for the
 * named literals while still accepting custom strings.
 *
 * Built-in types and their effects:
 * - `'slide'`      — horizontal push (direction-aware: forward/backward)
 * - `'fade'`       — cross-dissolve opacity
 * - `'zoom'`       — scale in/out with opacity
 * - `'slide-up'`   — new page enters from bottom, old fades up
 * - `'slide-down'` — new page enters from top, old fades down
 * - `'flip'`       — sequential 3D Y-axis flip (first half out, second half in)
 * - `'blur'`       — blur + opacity cross-fade
 * - `'reveal'`     — clip-path wipe: new page sweeps in from the right
 * - `'rotate'`     — subtle rotation + scale + opacity
 * - `'morph'`      — consumer sets `view-transition-name` on matching elements; no extra CSS
 * - `'none'`       — instant switch, no animation
 */
export type TransitionType =
  | 'slide'
  | 'fade'
  | 'zoom'
  | 'slide-up'
  | 'slide-down'
  | 'flip'
  | 'blur'
  | 'reveal'
  | 'rotate'
  | 'morph'
  | 'none'
  | (string & {});

/**
 * CSS transition token passed to React's `addTransitionType`.
 * `'slide'` is never a token — it expands to `'slide-forward'` or `'slide-back'`
 * depending on navigation direction. Use this type when writing custom
 * transition utilities that call `addTransitionType` directly.
 */
export type TransitionToken =
  | 'slide-forward'
  | 'slide-back'
  | 'fade'
  | 'zoom'
  | 'slide-up'
  | 'slide-down'
  | 'flip'
  | 'blur'
  | 'reveal'
  | 'rotate'
  | 'morph'
  | (string & {});

export type Direction = 'forward' | 'backward' | 'replace';

/**
 * CSS easing function for view transition animations.
 * Accepts all standard CSS timing functions and custom `cubic-bezier(...)` values.
 */
export type TransitionEasing =
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'linear'
  | (string & {});

/**
 * A destination passed to navigation functions and link components.
 *
 * Accepts the same forms as a browser `<a href>`:
 * - Absolute path:   `'/about'`, `'/users/123'`
 * - Relative path:   `'../settings'`, `'./details'`
 * - Path + query:    `'/search?q=foo'`
 * - Path + hash:     `'/docs#api'`
 * - Full URL:        `'https://example.com/page'`
 *
 * The concrete form depends on the host router — most SPA routers
 * expect an absolute path. Full URLs are only useful with external links,
 * which skip the transition interceptor anyway (target ≠ '_self').
 */
export type NavigationPath = string;

/**
 * Standard HTML browsing-context keywords plus custom frame names.
 * Any value other than `'_self'` causes `TransitionLink` to fall through
 * to browser-default behavior (no transition intercepted).
 */
export type LinkTarget = '_self' | '_blank' | '_parent' | '_top' | (string & {});

export interface NavigateOptions {
  replace?: boolean;
  state?: unknown;
}

/** Options for {@link useTransitionNavigate}. */
export interface TransitionNavigateOptions extends NavigateOptions {
  transition?: TransitionType;
  /** Override `--vtr-duration` for this navigation (milliseconds). */
  duration?: number;
  /** Override `--vtr-easing` for this navigation. */
  easing?: TransitionEasing;
}

export interface RenderLinkProps {
  to: NavigationPath;
  children: ReactNode;
  onClick: MouseEventHandler<HTMLElement>;
  target?: LinkTarget;
  className?: string;
  style?: CSSProperties;
}

export interface TransitionConfig {
  defaultTransition?: TransitionType;
  /** Default `--vtr-duration` override applied to every navigation (milliseconds). */
  defaultDuration?: number;
  /** Default `--vtr-easing` override applied to every navigation. */
  defaultEasing?: TransitionEasing;
  /**
   * Navigation function from the host router. Accepts an optional returned
   * Promise so TanStack Router and Next.js router.push are compatible.
   */
  navigate?: (to: NavigationPath, options?: NavigateOptions) => void | Promise<void>;
  renderLink?: (props: RenderLinkProps) => ReactElement;
}

export interface TransitionLinkProps {
  to: NavigationPath;
  transition?: TransitionType;
  /** Override `--vtr-duration` for this link's navigation (milliseconds). */
  duration?: number;
  /** Override `--vtr-easing` for this link's navigation. */
  easing?: TransitionEasing;
  replace?: boolean;
  /** Non-`'_self'` values fall through to browser default — no transition is intercepted. */
  target?: LinkTarget;
  navigate?: (to: NavigationPath, options?: NavigateOptions) => void | Promise<void>;
  renderLink?: (props: RenderLinkProps) => ReactElement;
  children?: ReactNode;
  className?: string;
  style?: CSSProperties;
}
