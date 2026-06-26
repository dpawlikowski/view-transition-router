'use client';

import { useContext, type MouseEvent } from 'react';
import { TransitionContext } from '../context';
import { addTransitionType, applyTransitionVars, supportsViewTransitions, toTransitionToken } from '../utils/transition';
import { DEFAULT_TRANSITION } from '../constants';
import type { TransitionLinkProps, Direction, NavigateOptions } from '../types';

export const TransitionLink = ({
  to,
  transition,
  duration: durationProp,
  easing: easingProp,
  replace: shouldReplace = false,
  target,
  navigate: navigateProp,
  renderLink: renderLinkProp,
  children,
  className,
  style,
}: TransitionLinkProps) => {
  const ctx = useContext(TransitionContext);

  const activeTransition = transition ?? ctx.config.defaultTransition ?? DEFAULT_TRANSITION;
  const duration = durationProp ?? ctx.config.defaultDuration;
  const easing = easingProp ?? ctx.config.defaultEasing;
  const navigate = navigateProp ?? ctx.config.navigate;
  const renderLink = renderLinkProp ?? ctx.config.renderLink;

  const doNavigate = () => {
    const opts: NavigateOptions = { replace: shouldReplace };
    if (navigate) {
      navigate(to, opts);
    } else if (shouldReplace) {
      window.location.replace(to);
    } else {
      window.location.assign(to);
    }
    // Advance the history idx ref after pushState/replaceState so the next
    // popstate delta is computed from the correct baseline.
    ctx._advanceHistoryRef();
  };

  const handleClick = (e: MouseEvent<HTMLElement>) => {
    // Fall through for: modifier keys, non-primary buttons, external targets.
    if (
      e.ctrlKey || e.metaKey || e.shiftKey || e.altKey ||
      e.button !== 0 ||
      (target != null && target !== '_self')
    ) return;

    e.preventDefault();

    if (!supportsViewTransitions() || activeTransition === 'none') {
      doNavigate();
      return;
    }

    const direction: Direction = shouldReplace ? 'replace' : 'forward';
    const token = toTransitionToken(activeTransition, direction);

    ctx._startTransition(() => {
      applyTransitionVars(duration, easing);
      addTransitionType?.(token);
      ctx._setTransition(direction, activeTransition);
      doNavigate();
    });
  };

  if (renderLink) {
    return renderLink({ to, children, onClick: handleClick, target, className, style });
  }

  return (
    <a href={to} target={target} onClick={handleClick} className={className} style={style}>
      {children}
    </a>
  );
};
