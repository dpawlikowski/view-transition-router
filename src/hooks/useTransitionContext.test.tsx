import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TransitionProvider } from '../components/TransitionProvider';
import { useTransitionContext } from './useTransitionContext';

describe('useTransitionContext', () => {
  it('returns stable defaults when called outside a provider', () => {
    const { result } = renderHook(() => useTransitionContext());
    expect(result.current.direction).toBe('replace');
    expect(result.current.transitionType).toBeNull();
    expect(result.current.isPending).toBe(false);
  });

  it('reflects state set by TransitionProvider', async () => {
    const navigate = () => {};
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TransitionProvider config={{ navigate }}>{children}</TransitionProvider>
    );

    const { result } = renderHook(() => useTransitionContext(), { wrapper });

    expect(result.current.direction).toBe('replace');
    expect(result.current.transitionType).toBeNull();
  });
});
