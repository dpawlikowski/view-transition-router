import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useTransitionNavigate } from 'view-transition-router';
const DURATIONS = [100, 300, 600, 1200];
const EASINGS = [
    { label: 'ease-in-out', value: 'ease-in-out' },
    { label: 'ease-in', value: 'ease-in' },
    { label: 'ease-out', value: 'ease-out' },
    { label: 'linear', value: 'linear' },
];
export function DurationDemo({ to }) {
    const navigate = useTransitionNavigate();
    const [duration, setDuration] = useState(300);
    const [easing, setEasing] = useState('ease-in-out');
    return (_jsxs("section", { className: "duration-demo", children: [_jsx("h2", { className: "gallery-title", children: "Duration & Easing" }), _jsxs("p", { className: "gallery-subtitle", children: ["Pick timing, then click ", _jsx("strong", { children: "Navigate" }), " to see the slide transition at that speed."] }), _jsxs("div", { className: "duration-controls", children: [_jsxs("div", { className: "control-group", children: [_jsx("span", { className: "control-label", children: "Duration" }), _jsx("div", { className: "pill-row", children: DURATIONS.map((d) => (_jsxs("button", { className: `pill${duration === d ? ' pill--active' : ''}`, onClick: () => setDuration(d), children: [d, "ms"] }, d))) })] }), _jsxs("div", { className: "control-group", children: [_jsx("span", { className: "control-label", children: "Easing" }), _jsx("div", { className: "pill-row", children: EASINGS.map(({ label, value }) => (_jsx("button", { className: `pill${easing === value ? ' pill--active' : ''}`, onClick: () => setEasing(value), children: label }, value))) })] })] }), _jsxs("button", { className: "navigate-btn", onClick: () => navigate(to, { transition: 'slide', duration, easing }), children: ["Navigate \u2192 ", to] })] }));
}
