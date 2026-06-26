import { useRef } from 'react';
import type { Direction } from '../types';

export const getHistoryIdx = (): number | undefined => {
  if (typeof window === 'undefined') return undefined;
  return (window.history.state as { idx?: number } | null)?.idx;
};

export const deltaToDirection = (delta: number): Direction => {
  if (delta > 0) return 'forward';
  if (delta < 0) return 'backward';
  return 'replace';
};

export const useNavigationDirection = () => {
  const prevHistoryIdxRef = useRef<number | undefined>(getHistoryIdx());

  const computeAndAdvance = (): Direction => {
    const prev = prevHistoryIdxRef.current;
    const next = getHistoryIdx();
    prevHistoryIdxRef.current = next;

    if (prev === undefined || next === undefined) return 'replace';
    return deltaToDirection(next - prev);
  };

  return { computeAndAdvance, prevHistoryIdxRef };
};
