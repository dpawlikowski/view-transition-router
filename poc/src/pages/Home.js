import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { withViewTransition } from 'view-transition-router';
import { Card } from './Card';
import { TransitionGallery } from './TransitionGallery';
import { DurationDemo } from './DurationDemo';
const FeaturedCard = withViewTransition(Card, 'featured-card');
const InfoCard = withViewTransition(Card, 'info-card');
export function Home() {
    return (_jsxs("main", { className: "page", children: [_jsx("h1", { children: "Home" }), _jsxs("p", { children: ["Select any transition in the gallery below to navigate to the About page with that animation. The status bar shows live state from", ' ', _jsx("code", { children: "useTransitionContext()" }), "."] }), _jsx(TransitionGallery, { to: "/about" }), _jsx(DurationDemo, { to: "/about" }), _jsx(FeaturedCard, { title: "Featured card", description: "Uses withViewTransition(Card, 'featured-card'). The About page mounts the same view-transition-name \u2014 the browser morphs between the two snapshots. Click the Morph button above to see it." }), _jsx(InfoCard, { title: "Info card", description: "view-transition-name: info-card. Unique name, no collision. For lists use withViewTransition(Card, `card-${item.id}`) per item." })] }));
}
