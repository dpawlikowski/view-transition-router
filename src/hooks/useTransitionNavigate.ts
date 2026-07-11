'use client';

import { useContext, useCallback } from 'react';
import { TransitionContext } from '../context';
import {
  addTransitionType,
  applyTransitionVars,
  prefersReducedMotion,
  resolveTransitionDirection,
  supportsViewTransitions,
  toTransitionToken,
} from '../utils/transition';
import { DEFAULT_TRANSITION } from '../constants';
import type { TransitionNavigateOptions, Direction, NavigateOptions, NavigationPath } from '../types';

export const useTransitionNavigate = () => {
  const ctx = useContext(TransitionContext);

  return useCallback(
    (to: NavigationPath | number, options: TransitionNavigateOptions = {}) => {
      const { transition, replace: shouldReplace = false, state, duration: durationOpt, easing: easingOpt } = options;
      const activeTransition = transition ?? ctx.config.defaultTransition ?? DEFAULT_TRANSITION;
      const duration = durationOpt ?? ctx.config.defaultDuration;
      const easing = easingOpt ?? ctx.config.defaultEasing;
      const navigate = ctx.config.navigate;

      const doNavigate = () => {
        if (typeof to === 'number') {
          // A zero delta would call history.go(0), which reloads the whole page
          // and destroys React state — almost never what a caller passing 0 wants.
          // Treat it as a no-op (the "replace" direction implies no movement).
          if (to === 0) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn(
                '[view-transition-router] useTransitionNavigate(0) is a no-op; ' +
                'history.go(0) would trigger a full page reload. Use your router to refresh instead.',
              );
            }
            return;
          }
          // history.go() navigates asynchronously; popstate handler advances the ref.
          if (typeof window !== 'undefined') window.history.go(to);
          return;
        }
        const opts: NavigateOptions = { replace: shouldReplace, state };
        try {
          if (navigate) {
            navigate(to, opts);
          } else {
            if (process.env.NODE_ENV !== 'production') {
              console.warn(
                '[view-transition-router] useTransitionNavigate has no `navigate` configured on ' +
                'TransitionProvider; falling back to window.location, which performs a full page reload. ' +
                'Pass `navigate` to TransitionProvider to integrate with your router.',
              );
            }
            if (shouldReplace) {
              window.location.replace(to);
            } else {
              window.location.assign(to);
            }
          }
        } finally {
          // Advance the history idx ref after pushState/replaceState — even if the
          // host router's navigate() threw — so the next popstate delta is computed
          // from the correct baseline rather than a stale one.
          ctx._advanceHistoryRef();
        }
      };

      if (!supportsViewTransitions() || activeTransition === 'none' || prefersReducedMotion()) {
        doNavigate();
        return;
      }

      const direction: Direction =
        typeof to === 'number'
          ? resolveTransitionDirection(to)
          : shouldReplace ? 'replace' : 'forward';

      const token = toTransitionToken(activeTransition, direction);

      ctx._startTransition(() => {
        applyTransitionVars(duration, easing);
        addTransitionType?.(token);
        ctx._setTransition(direction, activeTransition);
        doNavigate();
      });
    },
    // Depend only on the stable fields this callback reads — NOT the whole `ctx`
    // (which changes when `isPending` toggles on every navigation), so the returned
    // function keeps a stable identity and doesn't defeat memoization in consumers
    // that receive it as a prop. TransitionProvider memoizes each of these fields.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ctx.config, ctx._startTransition, ctx._setTransition, ctx._advanceHistoryRef],
  );
};
