import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { getHistoryIdx, deltaToDirection, useNavigationDirection } from './useNavigationDirection';

const setHistoryState = (state: unknown) =>
  Object.defineProperty(window.history, 'state', { value: state, configurable: true });

describe('getHistoryIdx', () => {
  beforeEach(() => setHistoryState(null));

  it('returns the idx from history.state', () => {
    setHistoryState({ idx: 5 });
    expect(getHistoryIdx()).toBe(5);
  });

  it('returns undefined when history.state is null', () => {
    setHistoryState(null);
    expect(getHistoryIdx()).toBeUndefined();
  });

  it('returns undefined when history.state has no idx property', () => {
    setHistoryState({ foo: 'bar' });
    expect(getHistoryIdx()).toBeUndefined();
  });
});

describe('deltaToDirection', () => {
  it.each([
    [ 1,  'forward'],
    [ 5,  'forward'],
    [-1,  'backward'],
    [-3,  'backward'],
    [ 0,  'replace'],
  ] as const)('delta %i → %s', (delta, expected) => {
    expect(deltaToDirection(delta)).toBe(expected);
  });
});

describe('useNavigationDirection', () => {
  it('computeAndAdvance returns replace when history.state is null', () => {
    setHistoryState(null);
    const { result } = renderHook(() => useNavigationDirection());
    expect(result.current.computeAndAdvance()).toBe('replace');
  });

  it('computeAndAdvance advances the ref so the next call sees the new idx as the baseline', () => {
    setHistoryState({ idx: 0 });
    const { result } = renderHook(() => useNavigationDirection());

    act(() => setHistoryState({ idx: 2 }));
    const first = result.current.computeAndAdvance(); // 2 - 0 = 2 → forward

    act(() => setHistoryState({ idx: 1 }));
    const second = result.current.computeAndAdvance(); // 1 - 2 = -1 → backward

    expect(first).toBe('forward');
    expect(second).toBe('backward');
  });
});
