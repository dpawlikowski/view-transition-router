import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { TransitionProvider } from '../components/TransitionProvider';
import { useTransitionNavigate } from './useTransitionNavigate';

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

const makeWrapper = (navigate = vi.fn()) =>
  ({ children }: { children: ReactNode }) => (
    <TransitionProvider config={{ navigate }}>{children}</TransitionProvider>
  );

describe('useTransitionNavigate — string path', () => {
  const navigate = vi.fn();

  beforeEach(() => {
    vi.mocked(transitionUtils.supportsViewTransitions).mockReturnValue(false);
  });

  it('calls config.navigate with the path and options', () => {
    const { result } = renderHook(() => useTransitionNavigate(), { wrapper: makeWrapper(navigate) });
    act(() => result.current('/about', { transition: 'fade' }));
    expect(navigate).toHaveBeenCalledWith('/about', { replace: false, state: undefined });
  });

  it('passes replace:true when option is set', () => {
    const { result } = renderHook(() => useTransitionNavigate(), { wrapper: makeWrapper(navigate) });
    act(() => result.current('/home', { replace: true }));
    expect(navigate).toHaveBeenCalledWith('/home', { replace: true, state: undefined });
  });

  it('forwards state to the navigate function', () => {
    const { result } = renderHook(() => useTransitionNavigate(), { wrapper: makeWrapper(navigate) });
    act(() => result.current('/profile', { state: { from: '/home' } }));
    expect(navigate).toHaveBeenCalledWith('/profile', { replace: false, state: { from: '/home' } });
  });

  it('calls addTransitionType with the resolved token when VT is supported', () => {
    vi.mocked(transitionUtils.supportsViewTransitions).mockReturnValue(true);
    const { result } = renderHook(() => useTransitionNavigate(), { wrapper: makeWrapper(navigate) });
    act(() => result.current('/about', { transition: 'fade' }));
    expect(transitionUtils.addTransitionType).toHaveBeenCalledWith('fade');
  });

  it('skips addTransitionType when VT is not supported', () => {
    const { result } = renderHook(() => useTransitionNavigate(), { wrapper: makeWrapper(navigate) });
    act(() => result.current('/about', { transition: 'slide' }));
    expect(transitionUtils.addTransitionType).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalled();
  });

  it('skips addTransitionType when transition is "none"', () => {
    vi.mocked(transitionUtils.supportsViewTransitions).mockReturnValue(true);
    const { result } = renderHook(() => useTransitionNavigate(), { wrapper: makeWrapper(navigate) });
    act(() => result.current('/about', { transition: 'none' }));
    expect(transitionUtils.addTransitionType).not.toHaveBeenCalled();
    expect(navigate).toHaveBeenCalled();
  });
});

describe('useTransitionNavigate — numeric delta', () => {
  let historyGo: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    historyGo = vi.spyOn(window.history, 'go').mockImplementation(() => {});
    vi.mocked(transitionUtils.supportsViewTransitions).mockReturnValue(true);
  });

  it('calls history.go(-1) for backward delta', () => {
    const { result } = renderHook(() => useTransitionNavigate(), { wrapper: makeWrapper() });
    act(() => result.current(-1, { transition: 'slide' }));
    expect(historyGo).toHaveBeenCalledWith(-1);
    expect(transitionUtils.addTransitionType).toHaveBeenCalledWith('slide-back');
  });

  it('calls history.go(1) for forward delta', () => {
    const { result } = renderHook(() => useTransitionNavigate(), { wrapper: makeWrapper() });
    act(() => result.current(1, { transition: 'slide' }));
    expect(historyGo).toHaveBeenCalledWith(1);
    expect(transitionUtils.addTransitionType).toHaveBeenCalledWith('slide-forward');
  });

  it('treats delta 0 as a no-op (history.go(0) would reload the whole page)', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useTransitionNavigate(), { wrapper: makeWrapper() });
    act(() => result.current(0, { transition: 'fade' }));
    expect(historyGo).not.toHaveBeenCalled();
    warn.mockRestore();
  });
});

describe('useTransitionNavigate — duration and easing', () => {
  beforeEach(() => {
    vi.mocked(transitionUtils.supportsViewTransitions).mockReturnValue(true);
  });

  it('calls applyTransitionVars with duration when provided', () => {
    const { result } = renderHook(() => useTransitionNavigate(), { wrapper: makeWrapper() });
    act(() => result.current('/about', { transition: 'fade', duration: 400 }));
    expect(transitionUtils.applyTransitionVars).toHaveBeenCalledWith(400, undefined);
  });

  it('calls applyTransitionVars with easing when provided', () => {
    const { result } = renderHook(() => useTransitionNavigate(), { wrapper: makeWrapper() });
    act(() => result.current('/about', { transition: 'fade', easing: 'ease-out' }));
    expect(transitionUtils.applyTransitionVars).toHaveBeenCalledWith(undefined, 'ease-out');
  });

  it('calls applyTransitionVars with both duration and easing', () => {
    const { result } = renderHook(() => useTransitionNavigate(), { wrapper: makeWrapper() });
    act(() => result.current('/about', { transition: 'fade', duration: 600, easing: 'linear' }));
    expect(transitionUtils.applyTransitionVars).toHaveBeenCalledWith(600, 'linear');
  });

  it('falls back to config defaults for duration and easing', () => {
    const wrapper = ({ children }: { children: ReactNode }) => (
      <TransitionProvider config={{ navigate: vi.fn(), defaultDuration: 1000, defaultEasing: 'ease-in-out' }}>
        {children}
      </TransitionProvider>
    );
    const { result } = renderHook(() => useTransitionNavigate(), { wrapper });
    act(() => result.current('/about', { transition: 'fade' }));
    expect(transitionUtils.applyTransitionVars).toHaveBeenCalledWith(1000, 'ease-in-out');
  });

  it('does not call applyTransitionVars when VT is not supported', () => {
    vi.mocked(transitionUtils.supportsViewTransitions).mockReturnValue(false);
    const { result } = renderHook(() => useTransitionNavigate(), { wrapper: makeWrapper() });
    act(() => result.current('/about', { transition: 'fade', duration: 600 }));
    expect(transitionUtils.applyTransitionVars).not.toHaveBeenCalled();
  });
});

describe('useTransitionNavigate — location fallbacks (no navigate in config)', () => {
  const assignFn = vi.fn();
  const replaceFn = vi.fn();

  const noNavigateWrapper = ({ children }: { children: ReactNode }) => (
    <TransitionProvider>{children}</TransitionProvider>
  );

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

  it('falls back to window.location.assign for forward navigation', () => {
    const { result } = renderHook(() => useTransitionNavigate(), { wrapper: noNavigateWrapper });
    act(() => result.current('/page'));
    expect(assignFn).toHaveBeenCalledWith('/page');
  });

  it('falls back to window.location.replace when replace is true', () => {
    const { result } = renderHook(() => useTransitionNavigate(), { wrapper: noNavigateWrapper });
    act(() => result.current('/page', { replace: true }));
    expect(replaceFn).toHaveBeenCalledWith('/page');
  });

  it('warns in dev when navigate is not configured', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { result } = renderHook(() => useTransitionNavigate(), { wrapper: noNavigateWrapper });
    act(() => result.current('/page'));
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('has no `navigate` configured'));
    warnSpy.mockRestore();
  });
});
