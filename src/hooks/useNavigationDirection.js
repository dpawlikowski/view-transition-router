import { useRef } from 'react';
export const getHistoryIdx = () => {
    if (typeof window === 'undefined')
        return undefined;
    return window.history.state?.idx;
};
export const deltaToDirection = (delta) => {
    if (delta > 0)
        return 'forward';
    if (delta < 0)
        return 'backward';
    return 'replace';
};
export const useNavigationDirection = () => {
    const prevHistoryIdxRef = useRef(getHistoryIdx());
    const computeAndAdvance = () => {
        const prev = prevHistoryIdxRef.current;
        const next = getHistoryIdx();
        prevHistoryIdxRef.current = next;
        if (prev === undefined || next === undefined)
            return 'replace';
        return deltaToDirection(next - prev);
    };
    return { computeAndAdvance, prevHistoryIdxRef };
};
