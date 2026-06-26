import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest';
import { supportsViewTransitions, toTransitionToken, applyTransitionVars } from './transition';

describe('supportsViewTransitions', () => {
  afterEach(() => {
    // Reset to jsdom default (no startViewTransition)
    Object.defineProperty(document, 'startViewTransition', {
      value: undefined,
      configurable: true,
    });
  });

  it('returns false when startViewTransition is not on document', () => {
    expect(supportsViewTransitions()).toBe(false);
  });

  it('returns true when startViewTransition is present', () => {
    Object.defineProperty(document, 'startViewTransition', {
      value: () => {},
      configurable: true,
    });
    expect(supportsViewTransitions()).toBe(true);
  });
});

describe('toTransitionToken', () => {
  it.each([
    // slide expands based on direction
    ['slide', 'forward',  'slide-forward'],
    ['slide', 'backward', 'slide-back'],
    ['slide', 'replace',  'slide-forward'], // replace treated as forward
    // non-slide types pass through unchanged
    ['fade',  'forward',  'fade'],
    ['fade',  'backward', 'fade'],
    ['morph', 'forward',  'morph'],
    ['none',  'forward',  'none'],
    // custom strings pass through
    ['zoom',  'forward',  'zoom'],
    ['zoom',  'backward', 'zoom'],
  ] as const)('(%s, %s) → %s', (transition, direction, expected) => {
    expect(toTransitionToken(transition, direction)).toBe(expected);
  });
});

describe('applyTransitionVars', () => {
  beforeEach(() => { vi.useFakeTimers(); });

  afterEach(() => {
    vi.useRealTimers();
    document.documentElement.style.removeProperty('--vtr-duration');
    document.documentElement.style.removeProperty('--vtr-easing');
  });

  it('does nothing when called with no arguments', () => {
    applyTransitionVars();
    expect(document.documentElement.style.getPropertyValue('--vtr-duration')).toBe('');
    expect(document.documentElement.style.getPropertyValue('--vtr-easing')).toBe('');
  });

  it('sets --vtr-duration when duration is provided', () => {
    applyTransitionVars(500);
    expect(document.documentElement.style.getPropertyValue('--vtr-duration')).toBe('500ms');
  });

  it('sets --vtr-easing when easing is provided', () => {
    applyTransitionVars(undefined, 'ease-in');
    expect(document.documentElement.style.getPropertyValue('--vtr-easing')).toBe('ease-in');
  });

  it('sets both vars when both are provided', () => {
    applyTransitionVars(800, 'linear');
    expect(document.documentElement.style.getPropertyValue('--vtr-duration')).toBe('800ms');
    expect(document.documentElement.style.getPropertyValue('--vtr-easing')).toBe('linear');
  });

  it('removes vars after (duration + 50)ms', () => {
    applyTransitionVars(500, 'ease-out');
    vi.advanceTimersByTime(549);
    expect(document.documentElement.style.getPropertyValue('--vtr-duration')).toBe('500ms');
    vi.advanceTimersByTime(2);
    expect(document.documentElement.style.getPropertyValue('--vtr-duration')).toBe('');
    expect(document.documentElement.style.getPropertyValue('--vtr-easing')).toBe('');
  });

  it('uses 300ms as default for cleanup timing when no duration provided', () => {
    applyTransitionVars(undefined, 'ease-in');
    vi.advanceTimersByTime(349);
    expect(document.documentElement.style.getPropertyValue('--vtr-easing')).toBe('ease-in');
    vi.advanceTimersByTime(2);
    expect(document.documentElement.style.getPropertyValue('--vtr-easing')).toBe('');
  });
});
