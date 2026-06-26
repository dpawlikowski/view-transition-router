import { useContext } from 'react';
import { TransitionContext } from '../context';

export const useTransitionContext = () => {
  const ctx = useContext(TransitionContext);
  return {
    direction: ctx.direction,
    transitionType: ctx.transitionType,
    isPending: ctx.isPending,
  };
};
