/**
 * Integration tests — full provider + component flows with no internal mocks.
 * Only external boundaries (navigate callback, addTransitionType) are spied on.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TransitionProvider } from '../components/TransitionProvider';
import { TransitionLink } from '../components/TransitionLink';
import { useTransitionContext } from '../hooks/useTransitionContext';
import { useTransitionNavigate } from '../hooks/useTransitionNavigate';

vi.mock('../utils/transition', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/transition')>();
  return {
    ...actual,
    addTransitionType: vi.fn(),
    supportsViewTransitions: vi.fn().mockReturnValue(true),
    applyTransitionVars: vi.fn(),
  };
});

vi.mock('../hooks/useNavigationDirection', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../hooks/useNavigationDirection')>();
  return { ...actual, getHistoryIdx: vi.fn().mockReturnValue(0) };
});

import * as transitionUtils from '../utils/transition';

// ─── helpers ────────────────────────────────────────────────────────────────

const ContextDisplay = () => {
  const { direction, transitionType, isPending } = useTransitionContext();
  return (
    <div
      data-testid="ctx"
      data-direction={direction}
      data-type={String(transitionType)}
      data-pending={String(isPending)}
    />
  );
};

// ─── tests ───────────────────────────────────────────────────────────────────

describe('TransitionProvider + TransitionLink', () => {
  it('calls navigate and updates context direction when a link is clicked', async () => {
    const navigate = vi.fn();

    render(
      <TransitionProvider config={{ navigate }}>
        <TransitionLink to="/about" transition="fade">Go</TransitionLink>
        <ContextDisplay />
      </TransitionProvider>,
    );

    await userEvent.click(screen.getByText('Go'));

    expect(navigate).toHaveBeenCalledWith('/about', { replace: false });
    expect(screen.getByTestId('ctx')).toHaveAttribute('data-direction', 'forward');
    expect(screen.getByTestId('ctx')).toHaveAttribute('data-type', 'fade');
  });

  it('calls addTransitionType with the correct CSS token', async () => {
    const navigate = vi.fn();

    render(
      <TransitionProvider config={{ navigate }}>
        <TransitionLink to="/about" transition="slide">Go</TransitionLink>
      </TransitionProvider>,
    );

    await userEvent.click(screen.getByText('Go'));

    expect(transitionUtils.addTransitionType).toHaveBeenCalledWith('slide-forward');
  });

  it('does not intercept modified clicks — the browser handles them', () => {
    const navigate = vi.fn();

    render(
      <TransitionProvider config={{ navigate }}>
        <TransitionLink to="/about">Go</TransitionLink>
      </TransitionProvider>,
    );

    fireEvent.click(screen.getByText('Go'), { metaKey: true });
    fireEvent.click(screen.getByText('Go'), { ctrlKey: true });

    expect(navigate).not.toHaveBeenCalled();
    expect(transitionUtils.addTransitionType).not.toHaveBeenCalled();
  });
});

describe('TransitionProvider + useTransitionNavigate', () => {
  const navigate = vi.fn();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <TransitionProvider config={{ navigate }}>{children}</TransitionProvider>
  );

  it('navigates to a path and updates context', () => {
    const { result } = renderHook(
      () => ({ nav: useTransitionNavigate(), ctx: useTransitionContext() }),
      { wrapper },
    );

    act(() => result.current.nav('/dashboard', { transition: 'fade' }));

    expect(navigate).toHaveBeenCalledWith('/dashboard', { replace: false, state: undefined });
    expect(result.current.ctx.direction).toBe('forward');
    expect(result.current.ctx.transitionType).toBe('fade');
  });

  it('detects backward direction for negative deltas', () => {
    const historyGo = vi.spyOn(window.history, 'go').mockImplementation(() => {});
    const { result } = renderHook(() => useTransitionNavigate(), { wrapper });

    act(() => result.current(-1, { transition: 'slide' }));

    expect(historyGo).toHaveBeenCalledWith(-1);
    expect(transitionUtils.addTransitionType).toHaveBeenCalledWith('slide-back');
  });
});

describe('duration and easing propagation', () => {
  it('calls applyTransitionVars when duration is set on TransitionLink', async () => {
    const navigate = vi.fn();

    render(
      <TransitionProvider config={{ navigate }}>
        <TransitionLink to="/about" transition="fade" duration={600}>Go</TransitionLink>
      </TransitionProvider>,
    );

    await userEvent.click(screen.getByText('Go'));
    expect(transitionUtils.applyTransitionVars).toHaveBeenCalledWith(600, undefined);
  });

  it('calls applyTransitionVars from config defaults', async () => {
    const navigate = vi.fn();

    render(
      <TransitionProvider config={{ navigate, defaultDuration: 1200, defaultEasing: 'linear' }}>
        <TransitionLink to="/about" transition="fade">Go</TransitionLink>
      </TransitionProvider>,
    );

    await userEvent.click(screen.getByText('Go'));
    expect(transitionUtils.applyTransitionVars).toHaveBeenCalledWith(1200, 'linear');
  });
});

describe('popstate — back button updates context', () => {
  beforeEach(() => {
    vi.mocked(transitionUtils.supportsViewTransitions).mockReturnValue(true);
  });

  it('sets direction to backward when history idx decreases', async () => {
    const { getHistoryIdx } = await import('../hooks/useNavigationDirection');
    vi.mocked(getHistoryIdx)
      .mockReturnValueOnce(3)   // useRef init → prevHistoryIdxRef = 3
      .mockReturnValue(2);      // handlePopState → next=2, delta=-1 → backward

    render(
      <TransitionProvider>
        <ContextDisplay />
      </TransitionProvider>,
    );

    act(() => window.dispatchEvent(new PopStateEvent('popstate')));

    expect(screen.getByTestId('ctx')).toHaveAttribute('data-direction', 'backward');
  });
});
