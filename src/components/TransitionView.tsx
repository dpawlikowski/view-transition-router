'use client';

import React, { type ReactNode } from 'react';
import { DEFAULT_OUTLET_NAME } from '../constants';

type VTProps = { name?: string; children?: ReactNode };
const ReactViewTransition = (React as unknown as { ViewTransition?: React.ComponentType<VTProps> }).ViewTransition;

export interface TransitionViewProps {
  /**
   * The `view-transition-name` applied to the outlet wrapper.
   * Must match the name targeted in your CSS transition rules.
   * Defaults to `DEFAULT_OUTLET_NAME` (`'vtr-page'`), which the built-in stylesheet already targets.
   */
  name?: string;
  children: ReactNode;
}

export const TransitionView = ({ name = DEFAULT_OUTLET_NAME, children }: TransitionViewProps) => {
  if (!ReactViewTransition) return <>{children}</>;
  return <ReactViewTransition name={name}>{children}</ReactViewTransition>;
};
