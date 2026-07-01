'use client';

import { type ComponentType, type FC, type ReactNode, useEffect } from 'react';
import React from 'react';

const FALLBACK_TRANSITION_NAME = 'view';

type VTProps = { name?: string; children?: ReactNode };
const ReactViewTransition = (React as unknown as { ViewTransition?: ComponentType<VTProps> }).ViewTransition;

const activeNames = process.env.NODE_ENV !== 'production' ? new Map<string, number>() : null;

const useDuplicateNameWarning = (name: string) => {
  useEffect(() => {
    if (!activeNames) return;
    const count = (activeNames.get(name) ?? 0) + 1;
    activeNames.set(name, count);
    if (count > 1) {
      console.warn(
        `[view-transition-router] Multiple mounted components share the view-transition-name "${name}". ` +
        'The browser silently skips the transition when a name is not unique per-frame. Pass a ' +
        'stable, key-derived name function to withViewTransition when rendering a list.',
      );
    }
    return () => {
      const next = (activeNames.get(name) ?? 1) - 1;
      if (next <= 0) activeNames.delete(name);
      else activeNames.set(name, next);
    };
  }, [name]);
};

/**
 * Wraps a component in `<ViewTransition name={name}>` for shared-element transitions.
 *
 * @param name  Static string, or a function that receives component props and returns the name.
 *              Using a function lets list items derive unique names from their data without
 *              creating a wrapper component per item.
 *
 * @example
 * // Static name — one instance per page.
 * const HeroImage = withViewTransition(Image, 'hero');
 *
 * // Dynamic name — list items with unique names.
 * const ProductCard = withViewTransition(Card, (props) => `product-${props.id}`);
 */
export const withViewTransition = <P extends object>(
  Component: ComponentType<P>,
  name?: string | ((props: NoInfer<P>) => string),
): ComponentType<P> => {
  const Wrapped: FC<P> = (props) => {
    // Resolve name unconditionally so a dynamic name function always receives props,
    // even when ViewTransition is unavailable and the name itself is unused.
    const transitionName =
      typeof name === 'function'
        ? name(props)
        : (name || Component.displayName || Component.name || FALLBACK_TRANSITION_NAME);

    useDuplicateNameWarning(transitionName);

    if (!ReactViewTransition) {
      return <Component {...props} />;
    }

    return (
      <ReactViewTransition name={transitionName}>
        <Component {...props} />
      </ReactViewTransition>
    );
  };

  Wrapped.displayName = `WithViewTransition(${Component.displayName || Component.name || 'Component'})`;
  return Wrapped;
};
