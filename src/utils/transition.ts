import React from 'react';
import type { Direction, TransitionType, TransitionToken } from '../types';
import { DEFAULT_TRANSITION_DURATION_MS } from '../constants';

/**
 * Extra delay (ms) added before clearing the inline `--vtr-*` overrides, so the
 * cleanup timer never races the end of a running animation.
 */
const VAR_CLEANUP_BUFFER_MS = 50;

/** Duck-typed at module load — undefined on React < 19 experimental. */
export const addTransitionType = (
  React as unknown as { addTransitionType?: (type: string) => void }
).addTransitionType;

export const supportsViewTransitions = (): boolean =>
  typeof document !== 'undefined' && 'startViewTransition' in document;

/**
 * JS-level reduced-motion check, complementing the CSS-only
 * `prefers-reduced-motion` media query in `styles/base.css`. Consumers who
 * skip `startViewTransition` entirely (rather than letting it run with no
 * visible animation) can gate on this before calling `doNavigate`.
 */
export const prefersReducedMotion = (): boolean =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Resolves the navigation {@link Direction} for a `useTransitionNavigate` call
 * targeting a numeric history delta (as passed to `history.go`).
 *
 * `0` is treated as `'replace'` (no directional slide), negative deltas are
 * `'backward'`, and positive deltas are `'forward'`.
 */
export const resolveTransitionDirection = (to: number): Direction => {
  if (to === 0) return 'replace';
  return to < 0 ? 'backward' : 'forward';
};

/** Maps a user-facing {@link TransitionType} + direction to the CSS token passed to `addTransitionType`. */
export const toTransitionToken = (transition: TransitionType, direction: Direction): TransitionToken => {
  if (transition === 'slide') {
    return direction === 'backward' ? 'slide-back' : 'slide-forward';
  }
  return transition;
};

/**
 * Sets `--vtr-duration` and/or `--vtr-easing` on `:root` inline style before a view
 * transition starts, then removes them after the animation completes so the CSS
 * defaults from `variables.css` are restored for the next navigation.
 *
 * Must be called synchronously before `document.startViewTransition` captures the
 * new frame — i.e. inside the `startTransition` callback, before `navigate()`.
 */
export const applyTransitionVars = (duration?: number, easing?: string): void => {
  if (typeof document === 'undefined') return;
  if (duration === undefined && easing === undefined) return;

  const root = document.documentElement;
  if (duration !== undefined) root.style.setProperty('--vtr-duration', `${duration}ms`);
  if (easing !== undefined) root.style.setProperty('--vtr-easing', easing);

  // CSS animations read timing values at start-time, so removing the inline
  // overrides after the animation has started does not affect the running animation.
  setTimeout(() => {
    if (duration !== undefined) root.style.removeProperty('--vtr-duration');
    if (easing !== undefined) root.style.removeProperty('--vtr-easing');
  }, (duration ?? DEFAULT_TRANSITION_DURATION_MS) + VAR_CLEANUP_BUFFER_MS);
};
