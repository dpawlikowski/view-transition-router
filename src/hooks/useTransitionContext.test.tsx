import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TransitionProvider } from '../components/TransitionProvider';
import { useTransitionContext } from './useTransitionContext';
import { useTransitionNavigate } from './useTransitionNavigate';

vi.mock('../utils/transition', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/transition')>();
  return {
    ...actual,
    addTransitionType: vi.fn(),
    supportsViewTransitions: vi.fn().mockReturnValue(true),
    applyTransitionVars: vi.fn(),
  };
});

describe('useTransitionContext', () => {
  it('returns stable defaults when called outside a provider', () => {
    const { result } = renderHook(() => useTransitionContext());
    expect(result.current.direction).toBe('replace');
    expect(result.current.transitionType).toBeNull();
    expect(result.current.isPending).toBe(false);
  });

  it('reflects initial state set by TransitionProvider', () => {
    const navigate = vi.fn();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TransitionProvider config={{ navigate }}>{children}</TransitionProvider>
    );

    const { result } = renderHook(() => useTransitionContext(), { wrapper });

    expect(result.current.direction).toBe('replace');
    expect(result.current.transitionType).toBeNull();
  });

  it('updates direction and transitionType after a programmatic navigation', () => {
    const navigate = vi.fn();
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TransitionProvider config={{ navigate }}>{children}</TransitionProvider>
    );

    const { result } = renderHook(
      () => ({ ctx: useTransitionContext(), nav: useTransitionNavigate() }),
      { wrapper },
    );

    act(() => result.current.nav('/about', { transition: 'zoom' }));

    expect(result.current.ctx.direction).toBe('forward');
    expect(result.current.ctx.transitionType).toBe('zoom');
  });

  it('only exposes direction, transitionType, and isPending — not internal members', () => {
    const { result } = renderHook(() => useTransitionContext());
    const keys = Object.keys(result.current);
    expect(keys).toEqual(expect.arrayContaining(['direction', 'transitionType', 'isPending']));
    expect(keys).not.toContain('_setTransition');
    expect(keys).not.toContain('_startTransition');
    expect(keys).not.toContain('_advanceHistoryRef');
    expect(keys).not.toContain('config');
  });
});
