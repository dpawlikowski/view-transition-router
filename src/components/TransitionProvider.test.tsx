import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { TransitionProvider } from './TransitionProvider';
import { useTransitionContext } from '../hooks/useTransitionContext';

vi.mock('../hooks/useNavigationDirection', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../hooks/useNavigationDirection')>();
  return { ...actual, getHistoryIdx: vi.fn() };
});

import { getHistoryIdx } from '../hooks/useNavigationDirection';

const ContextDisplay = () => {
  const { direction, transitionType } = useTransitionContext();
  return <div data-testid="ctx">{direction}:{String(transitionType)}</div>;
};

describe('TransitionProvider', () => {
  beforeEach(() => {
    vi.mocked(getHistoryIdx).mockReturnValue(0);
  });

  it('renders children', () => {
    render(
      <TransitionProvider>
        <span>child</span>
      </TransitionProvider>,
    );
    expect(screen.getByText('child')).toBeInTheDocument();
  });

  it('exposes default context values on initial render', () => {
    render(
      <TransitionProvider>
        <ContextDisplay />
      </TransitionProvider>,
    );
    expect(screen.getByTestId('ctx')).toHaveTextContent('replace:null');
  });

  it('computes forward direction on popstate when idx increases', () => {
    vi.mocked(getHistoryIdx)
      .mockReturnValueOnce(0)   // useRef(getHistoryIdx()) initializes prevHistoryIdxRef to 0
      .mockReturnValue(1);      // getHistoryIdx() inside handlePopState → next=1, delta=+1 → forward

    render(
      <TransitionProvider>
        <ContextDisplay />
      </TransitionProvider>,
    );

    act(() => window.dispatchEvent(new PopStateEvent('popstate')));

    expect(screen.getByTestId('ctx')).toHaveTextContent('forward:slide');
  });

  it('computes backward direction on popstate when idx decreases', () => {
    vi.mocked(getHistoryIdx)
      .mockReturnValueOnce(3)   // useRef init → prevHistoryIdxRef = 3
      .mockReturnValue(2);      // handlePopState → next=2, delta=-1 → backward

    render(
      <TransitionProvider>
        <ContextDisplay />
      </TransitionProvider>,
    );

    act(() => window.dispatchEvent(new PopStateEvent('popstate')));

    expect(screen.getByTestId('ctx')).toHaveTextContent('backward:slide');
  });

  it('uses config.defaultTransition for popstate transitions', () => {
    vi.mocked(getHistoryIdx)
      .mockReturnValueOnce(0)   // useRef init
      .mockReturnValue(1);      // handlePopState → forward

    render(
      <TransitionProvider config={{ defaultTransition: 'fade' }}>
        <ContextDisplay />
      </TransitionProvider>,
    );

    act(() => window.dispatchEvent(new PopStateEvent('popstate')));

    expect(screen.getByTestId('ctx')).toHaveTextContent('forward:fade');
  });
});
