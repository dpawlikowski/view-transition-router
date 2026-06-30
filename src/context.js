import { createContext } from 'react';
export const TransitionContext = createContext({
    direction: 'replace',
    transitionType: null,
    isPending: false,
    config: {},
    _setTransition: () => { },
    _startTransition: (fn) => fn(),
    _advanceHistoryRef: () => { },
});
