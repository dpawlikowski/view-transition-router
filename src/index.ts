'use client';

export { TransitionProvider } from './components/TransitionProvider';
export { TransitionLink } from './components/TransitionLink';
export { TransitionView } from './components/TransitionView';
export { withViewTransition } from './components/withViewTransition';
export { useTransitionContext } from './hooks/useTransitionContext';
export { useTransitionNavigate } from './hooks/useTransitionNavigate';

export { DEFAULT_OUTLET_NAME } from './constants';

export type { TransitionType, TransitionToken, TransitionEasing, Direction, LinkTarget, NavigationPath, TransitionLinkProps, TransitionConfig, NavigateOptions, TransitionNavigateOptions } from './types';
export type { TransitionViewProps } from './components/TransitionView';
