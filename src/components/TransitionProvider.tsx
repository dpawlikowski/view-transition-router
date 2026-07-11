'use client';

import {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
  useTransition,
  type ReactNode,
} from 'react';
import { TransitionContext } from '../context';
import { getHistoryIdx, deltaToDirection } from '../hooks/useNavigationDirection';
import { addTransitionType, supportsViewTransitions, toTransitionToken } from '../utils/transition';
import { DEFAULT_TRANSITION } from '../constants';
import type { Direction, TransitionType, TransitionConfig } from '../types';

interface TransitionProviderProps {
  children: ReactNode;
  config?: TransitionConfig;
}

export const TransitionProvider = ({ children, config = {} }: TransitionProviderProps) => {
  const [isPending, startTransition] = useTransition();
  const [direction, setDirection] = useState<Direction>('replace');
  const [transitionType, setTransitionType] = useState<TransitionType | null>(null);

  // Rebuild a stable config object keyed on its individual fields, so passing an
  // inline `config={{...}}` object literal (the natural usage) doesn't hand every
  // consumer a new `ctx.config` reference on each render.
  const { defaultTransition, defaultDuration, defaultEasing, navigate, renderLink } = config;
  const stableConfig = useMemo<TransitionConfig>(
    () => ({ defaultTransition, defaultDuration, defaultEasing, navigate, renderLink }),
    [defaultTransition, defaultDuration, defaultEasing, navigate, renderLink],
  );

  // Tracks the idx of the history entry we were on BEFORE the most recent navigation.
  // Updated in two places only:
  //   1. _advanceHistoryRef() — called by TransitionLink/useTransitionNavigate after pushState
  //   2. handlePopState() — after computing the direction from a browser back/forward
  //
  // Deliberately NOT synced via useLayoutEffect after every render: React Router registers
  // its own popstate listener and may flush a synchronous React render before our listener
  // fires, which would reset this ref to the new idx and make delta = 0.
  const prevHistoryIdxRef = useRef<number | undefined>(getHistoryIdx());

  const _advanceHistoryRef = useCallback(() => {
    prevHistoryIdxRef.current = getHistoryIdx();
  }, []);

  const _setTransition = useCallback((dir: Direction, type: TransitionType | null) => {
    setDirection(dir);
    setTransitionType(type);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const prev = prevHistoryIdxRef.current;
      const next = getHistoryIdx();
      // Advance the ref so the NEXT popstate delta is computed from this point.
      prevHistoryIdxRef.current = next;

      const dir =
        prev !== undefined && next !== undefined
          ? deltaToDirection(next - prev)
          : 'replace';

      const activeTransition = defaultTransition ?? DEFAULT_TRANSITION;

      // Wrap in startTransition so addTransitionType is called during an active
      // React transition batch — this is what triggers <ViewTransition> to fire
      // document.startViewTransition for browser back/forward navigations.
      // capture:true (below) fires our handler before React Router's bubble listener,
      // giving React a chance to batch our transition with the router's state update.
      if (supportsViewTransitions() && activeTransition !== 'none') {
        const token = toTransitionToken(activeTransition, dir);
        startTransition(() => {
          addTransitionType?.(token);
          setDirection(dir);
          setTransitionType(activeTransition);
        });
      } else {
        setDirection(dir);
        setTransitionType(activeTransition);
      }
    };

    window.addEventListener('popstate', handlePopState, { capture: true });
    return () => window.removeEventListener('popstate', handlePopState, { capture: true });
  }, [defaultTransition, startTransition]);

  const value = useMemo(
    () => ({
      direction,
      transitionType,
      isPending,
      config: stableConfig,
      _setTransition,
      _startTransition: startTransition,
      _advanceHistoryRef,
    }),
    [direction, transitionType, isPending, stableConfig, _setTransition, startTransition, _advanceHistoryRef],
  );

  return <TransitionContext.Provider value={value}>{children}</TransitionContext.Provider>;
};
