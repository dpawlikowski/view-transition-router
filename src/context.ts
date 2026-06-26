import { createContext } from 'react';
import type { Direction, TransitionType, TransitionConfig } from './types';

export interface TransitionContextValue {
  direction: Direction;
  transitionType: TransitionType | null;
  isPending: boolean;
  config: TransitionConfig;
  /** @internal — use useTransitionContext() for public access. */
  _setTransition: (direction: Direction, type: TransitionType | null) => void;
  /** @internal — shared startTransition from TransitionProvider's useTransition. */
  _startTransition: (callback: () => void) => void;
  /** @internal — call after pushState/replaceState navigations to keep the history idx ref current. */
  _advanceHistoryRef: () => void;
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
