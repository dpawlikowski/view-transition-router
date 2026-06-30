import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { withViewTransition, useTransitionNavigate } from 'view-transition-router';
import { Card } from './Card';
import { TransitionGallery } from './TransitionGallery';
import { DurationDemo } from './DurationDemo';
const AnimatedCard = withViewTransition(Card, 'featured-card');
export function About() {
    const navigate = useTransitionNavigate();
    return (_jsxs("main", { className: "page", children: [_jsx("h1", { children: "About" }), _jsxs("p", { children: ["Select any transition to navigate back to the Home page. The buttons below demonstrate ", _jsx("code", { children: "useTransitionNavigate()" }), " with delta (\u22121) and path navigation."] }), _jsxs("div", { style: { display: 'flex', gap: '0.75rem', marginBottom: '2rem' }, children: [_jsx("button", { onClick: () => navigate(-1, { transition: 'slide' }), children: "\u2190 Back (slide)" }), _jsx("button", { onClick: () => navigate('/', { transition: 'fade' }), children: "Home (fade)" })] }), _jsx(TransitionGallery, { to: "/" }), _jsx(DurationDemo, { to: "/" }), _jsx(AnimatedCard, { title: "Featured card", description: "Same view-transition-name as on Home. Use the Morph button above to see the shared-element cross-page animation." })] }));
}
