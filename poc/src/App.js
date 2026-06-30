import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Outlet, useNavigate } from 'react-router-dom';
import { TransitionProvider, TransitionLink, TransitionView, useTransitionContext } from 'view-transition-router';
function StatusBar() {
    const { direction, transitionType, isPending } = useTransitionContext();
    return (_jsxs("div", { className: "status-bar", "data-testid": "status-bar", children: ["direction: ", _jsx("strong", { "data-testid": "status-direction", children: direction }), ' · ', "type: ", _jsx("strong", { "data-testid": "status-type", children: transitionType ?? '—' }), ' · ', "pending: ", _jsx("strong", { "data-testid": "status-pending", children: String(isPending) })] }));
}
export function App() {
    const navigate = useNavigate();
    return (_jsxs(TransitionProvider, { config: { navigate }, children: [_jsxs("header", { children: [_jsxs("nav", { children: [_jsx(TransitionLink, { to: "/", transition: "slide", children: "Home" }), _jsx(TransitionLink, { to: "/about", transition: "slide", children: "About" }), _jsx(TransitionLink, { to: "/about", transition: "fade", children: "About (fade)" })] }), _jsx(StatusBar, {})] }), _jsx(TransitionView, { children: _jsx(Outlet, {}) })] }));
}
