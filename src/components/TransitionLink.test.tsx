import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransitionProvider } from './TransitionProvider';
import { TransitionLink } from './TransitionLink';

vi.mock('../utils/transition', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../utils/transition')>();
  return {
    ...actual,
    addTransitionType: vi.fn(),
    supportsViewTransitions: vi.fn().mockReturnValue(false),
    applyTransitionVars: vi.fn(),
  };
});

import * as transitionUtils from '../utils/transition';

const setup = (props: Partial<React.ComponentProps<typeof TransitionLink>> & { to: string }, navigate = vi.fn()) =>
  render(
    <TransitionProvider config={{ navigate }}>
      <TransitionLink {...props}>{props.children ?? 'Link'}</TransitionLink>
    </TransitionProvider>,
  );

describe('TransitionLink — rendering', () => {
  it('renders an anchor tag by default', () => {
    setup({ to: '/about' });
    expect(screen.getByRole('link', { name: 'Link' })).toBeInTheDocument();
  });

  it('renders via renderLink prop when provided', () => {
    setup({
      to: '/about',
      renderLink: ({ to, children, onClick }) => (
        <button data-testid="custom" data-to={to} onClick={onClick}>{children}</button>
      ),
    });
    expect(screen.getByTestId('custom')).toBeInTheDocument();
  });
});

describe('TransitionLink — click interception', () => {
  it('calls navigate on a plain left click', async () => {
    const navigate = vi.fn();
    setup({ to: '/about' }, navigate);
    await userEvent.click(screen.getByRole('link'));
    expect(navigate).toHaveBeenCalledWith('/about', { replace: false });
  });

  it('passes replace:true when the replace prop is set', async () => {
    const navigate = vi.fn();
    setup({ to: '/home', replace: true }, navigate);
    await userEvent.click(screen.getByRole('link'));
    expect(navigate).toHaveBeenCalledWith('/home', { replace: true });
  });

  it('does not call navigate on Ctrl+click', () => {
    const navigate = vi.fn();
    setup({ to: '/about' }, navigate);
    fireEvent.click(screen.getByRole('link'), { ctrlKey: true });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not call navigate on Meta+click (Cmd on Mac)', () => {
    const navigate = vi.fn();
    setup({ to: '/about' }, navigate);
    fireEvent.click(screen.getByRole('link'), { metaKey: true });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not call navigate on Shift+click', () => {
    const navigate = vi.fn();
    setup({ to: '/about' }, navigate);
    fireEvent.click(screen.getByRole('link'), { shiftKey: true });
    expect(navigate).not.toHaveBeenCalled();
  });

  it('does not intercept clicks on target="_blank" links', async () => {
    const navigate = vi.fn();
    setup({ to: '/about', target: '_blank' }, navigate);
    await userEvent.click(screen.getByRole('link'));
    expect(navigate).not.toHaveBeenCalled();
  });

  it('does intercept clicks on target="_self" links', async () => {
    const navigate = vi.fn();
    setup({ to: '/about', target: '_self' }, navigate);
    await userEvent.click(screen.getByRole('link'));
    expect(navigate).toHaveBeenCalled();
  });
});

describe('TransitionLink — view transitions', () => {
  beforeEach(() => {
    vi.mocked(transitionUtils.supportsViewTransitions).mockReturnValue(false);
  });

  it('does not call addTransitionType when VT is not supported', async () => {
    setup({ to: '/about', transition: 'slide' });
    await userEvent.click(screen.getByRole('link'));
    expect(transitionUtils.addTransitionType).not.toHaveBeenCalled();
  });

  it('calls addTransitionType with the resolved token when VT is supported', async () => {
    vi.mocked(transitionUtils.supportsViewTransitions).mockReturnValue(true);
    setup({ to: '/about', transition: 'fade' });
    await userEvent.click(screen.getByRole('link'));
    expect(transitionUtils.addTransitionType).toHaveBeenCalledWith('fade');
  });

  it('uses slide-forward token for slide transition on a forward navigation', async () => {
    vi.mocked(transitionUtils.supportsViewTransitions).mockReturnValue(true);
    setup({ to: '/about', transition: 'slide' });
    await userEvent.click(screen.getByRole('link'));
    expect(transitionUtils.addTransitionType).toHaveBeenCalledWith('slide-forward');
  });

  it('uses replace direction for slide when replace prop is set', async () => {
    vi.mocked(transitionUtils.supportsViewTransitions).mockReturnValue(true);
    setup({ to: '/about', transition: 'slide', replace: true });
    await userEvent.click(screen.getByRole('link'));
    // replace → treated as slide-forward (not backward)
    expect(transitionUtils.addTransitionType).toHaveBeenCalledWith('slide-forward');
  });

  it('skips addTransitionType when transition is "none"', async () => {
    vi.mocked(transitionUtils.supportsViewTransitions).mockReturnValue(true);
    setup({ to: '/about', transition: 'none' });
    await userEvent.click(screen.getByRole('link'));
    expect(transitionUtils.addTransitionType).not.toHaveBeenCalled();
  });

  it('falls back to config.defaultTransition when no transition prop given', async () => {
    vi.mocked(transitionUtils.supportsViewTransitions).mockReturnValue(true);
    const navigate = vi.fn();
    render(
      <TransitionProvider config={{ navigate, defaultTransition: 'fade' }}>
        <TransitionLink to="/about">Link</TransitionLink>
      </TransitionProvider>,
    );
    await userEvent.click(screen.getByRole('link'));
    expect(transitionUtils.addTransitionType).toHaveBeenCalledWith('fade');
  });
});

describe('TransitionLink — duration and easing', () => {
  beforeEach(() => {
    vi.mocked(transitionUtils.supportsViewTransitions).mockReturnValue(true);
  });

  it('calls applyTransitionVars with duration when provided', async () => {
    setup({ to: '/about', transition: 'fade', duration: 600 });
    await userEvent.click(screen.getByRole('link'));
    expect(transitionUtils.applyTransitionVars).toHaveBeenCalledWith(600, undefined);
  });

  it('calls applyTransitionVars with easing when provided', async () => {
    setup({ to: '/about', transition: 'fade', easing: 'ease-in' });
    await userEvent.click(screen.getByRole('link'));
    expect(transitionUtils.applyTransitionVars).toHaveBeenCalledWith(undefined, 'ease-in');
  });

  it('calls applyTransitionVars with both duration and easing', async () => {
    setup({ to: '/about', transition: 'fade', duration: 800, easing: 'linear' });
    await userEvent.click(screen.getByRole('link'));
    expect(transitionUtils.applyTransitionVars).toHaveBeenCalledWith(800, 'linear');
  });

  it('falls back to config defaults for duration and easing', async () => {
    const navigate = vi.fn();
    render(
      <TransitionProvider config={{ navigate, defaultDuration: 800, defaultEasing: 'linear' }}>
        <TransitionLink to="/about" transition="fade">Link</TransitionLink>
      </TransitionProvider>,
    );
    await userEvent.click(screen.getByRole('link'));
    expect(transitionUtils.applyTransitionVars).toHaveBeenCalledWith(800, 'linear');
  });

  it('prop duration overrides config default', async () => {
    const navigate = vi.fn();
    render(
      <TransitionProvider config={{ navigate, defaultDuration: 800 }}>
        <TransitionLink to="/about" transition="fade" duration={200}>Link</TransitionLink>
      </TransitionProvider>,
    );
    await userEvent.click(screen.getByRole('link'));
    expect(transitionUtils.applyTransitionVars).toHaveBeenCalledWith(200, undefined);
  });

  it('does not call applyTransitionVars when VT is not supported', async () => {
    vi.mocked(transitionUtils.supportsViewTransitions).mockReturnValue(false);
    setup({ to: '/about', transition: 'fade', duration: 600 });
    await userEvent.click(screen.getByRole('link'));
    expect(transitionUtils.applyTransitionVars).not.toHaveBeenCalled();
  });
});

describe('TransitionLink — location fallbacks (no navigate prop or config)', () => {
  const assignFn = vi.fn();
  const replaceFn = vi.fn();

  beforeEach(() => {
    assignFn.mockReset();
    replaceFn.mockReset();
    Object.defineProperty(window, 'location', {
      value: { ...window.location, assign: assignFn, replace: replaceFn },
      writable: true,
      configurable: true,
    });
    vi.mocked(transitionUtils.supportsViewTransitions).mockReturnValue(false);
  });

  it('falls back to window.location.assign for a forward navigation', async () => {
    render(
      <TransitionProvider>
        <TransitionLink to="/about">Link</TransitionLink>
      </TransitionProvider>,
    );
    await userEvent.click(screen.getByRole('link'));
    expect(assignFn).toHaveBeenCalledWith('/about');
    expect(replaceFn).not.toHaveBeenCalled();
  });

  it('falls back to window.location.replace when replace prop is set', async () => {
    render(
      <TransitionProvider>
        <TransitionLink to="/about" replace>Link</TransitionLink>
      </TransitionProvider>,
    );
    await userEvent.click(screen.getByRole('link'));
    expect(replaceFn).toHaveBeenCalledWith('/about');
    expect(assignFn).not.toHaveBeenCalled();
  });
});

describe('TransitionLink — renderLink from context config', () => {
  it('uses renderLink from config when no renderLink prop is given', async () => {
    const navigate = vi.fn();
    const renderLink = vi.fn(({ to, children, onClick }: { to: string; children: React.ReactNode; onClick: React.MouseEventHandler<HTMLElement> }) => (
      <button data-testid="ctx-link" data-to={to} onClick={onClick}>{children}</button>
    ));

    render(
      <TransitionProvider config={{ navigate, renderLink }}>
        <TransitionLink to="/page">Go</TransitionLink>
      </TransitionProvider>,
    );

    expect(screen.getByTestId('ctx-link')).toHaveAttribute('data-to', '/page');
    await userEvent.click(screen.getByTestId('ctx-link'));
    expect(navigate).toHaveBeenCalledWith('/page', { replace: false });
  });

  it('prop renderLink overrides config renderLink', async () => {
    const navigate = vi.fn();
    const configRenderLink = vi.fn(() => <span data-testid="config-link">config</span>);
    const propRenderLink = vi.fn(({ children, onClick }: { children: React.ReactNode; onClick: React.MouseEventHandler<HTMLElement> }) => (
      <button data-testid="prop-link" onClick={onClick}>{children}</button>
    ));

    render(
      <TransitionProvider config={{ navigate, renderLink: configRenderLink }}>
        <TransitionLink to="/page" renderLink={propRenderLink}>Go</TransitionLink>
      </TransitionProvider>,
    );

    expect(screen.queryByTestId('config-link')).not.toBeInTheDocument();
    expect(screen.getByTestId('prop-link')).toBeInTheDocument();
  });
});
