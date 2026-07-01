import React from 'react';
import type { Direction, TransitionType, TransitionToken } from '../types';

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
  }, (duration ?? 300) + 50);
};
