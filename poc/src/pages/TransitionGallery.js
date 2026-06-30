import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useTransitionNavigate } from 'view-transition-router';
const TRANSITIONS = [
    { type: 'slide', label: 'Slide', description: 'Horizontal push, direction-aware' },
    { type: 'fade', label: 'Fade', description: 'Cross-dissolve opacity' },
    { type: 'zoom', label: 'Zoom', description: 'Scale in / out' },
    { type: 'slide-up', label: 'Slide Up', description: 'Enter from bottom, exit up' },
    { type: 'slide-down', label: 'Slide Down', description: 'Enter from top, exit down' },
    { type: 'flip', label: 'Flip', description: '3D Y-axis card flip' },
    { type: 'blur', label: 'Blur', description: 'Blur + opacity cross-fade' },
    { type: 'reveal', label: 'Reveal', description: 'Clip-path wipe from right' },
    { type: 'rotate', label: 'Rotate', description: 'Slight rotation + scale' },
    { type: 'morph', label: 'Morph', description: 'Shared-element (card morphs)' },
    { type: 'none', label: 'None', description: 'Instant — no animation' },
];
export function TransitionGallery({ to }) {
    const navigate = useTransitionNavigate();
    return (_jsxs("section", { className: "gallery", children: [_jsx("h2", { className: "gallery-title", children: "Transition gallery" }), _jsxs("p", { className: "gallery-subtitle", children: ["Click any card to navigate to ", _jsx("code", { children: to }), " with that transition."] }), _jsx("div", { className: "transition-grid", children: TRANSITIONS.map(({ type, label, description }) => (_jsxs("button", { className: "transition-btn", onClick: () => navigate(to, { transition: type }), "data-transition": type, children: [_jsx("span", { className: "transition-btn-label", children: label }), _jsx("code", { className: "transition-btn-type", children: type }), _jsx("span", { className: "transition-btn-desc", children: description })] }, type))) })] }));
}
