'use client';
import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
const FALLBACK_TRANSITION_NAME = 'view';
const ReactViewTransition = React.ViewTransition;
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
export const withViewTransition = (Component, name) => {
    const Wrapped = (props) => {
        // Resolve name unconditionally so a dynamic name function always receives props,
        // even when ViewTransition is unavailable and the name itself is unused.
        const transitionName = typeof name === 'function'
            ? name(props)
            : (name || Component.displayName || Component.name || FALLBACK_TRANSITION_NAME);
        if (!ReactViewTransition) {
            return _jsx(Component, { ...props });
        }
        return (_jsx(ReactViewTransition, { name: transitionName, children: _jsx(Component, { ...props }) }));
    };
    Wrapped.displayName = `WithViewTransition(${Component.displayName || Component.name || 'Component'})`;
    return Wrapped;
};
