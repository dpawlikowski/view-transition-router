import { createContext } from 'react';
import type { Direction, TransitionType, TransitionConfig } from './types';

/**
 * The transition applied to a single history edge, remembered so that a later
 * browser back/forward across that edge can replay the same animation instead
 * of falling back to the provider default.
 */
export interface TransitionRecord {
  type: TransitionType;
  duration?: number;
  easing?: string;
}

export interface TransitionContextValue {
  direction: Direction;
  transitionType: TransitionType | null;
  isPending: boolean;
  config: TransitionConfig;
  /** @internal — use useTransitionContext() for public access. */
  _setTransition: (direction: Direction, type: TransitionType | null) => void;
  /** @internal — shared startTransition from TransitionProvider's useTransition. */
  _startTransition: (callback: () => void) => void;
  /**
   * @internal — call after pushState/replaceState navigations to keep the history idx ref current.
   * Pass the {@link TransitionRecord} used for this navigation so a later back/forward across the
   * same history edge can replay it.
   */
  _advanceHistoryRef: (record?: TransitionRecord) => void;
}

export const TransitionContext = createContext<TransitionContextValue>({
  direction: 'replace',
  transitionType: null,
  isPending: false,
  config: {},
  _setTransition: () => {},
  _startTransition: (fn) => fn(),
  _advanceHistoryRef: () => {},
});
