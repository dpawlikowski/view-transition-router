import React from 'react';
import { withViewTransition } from 'view-transition-router';
import { Card } from './Card';
import { TransitionGallery } from './TransitionGallery';
import { DurationDemo } from './DurationDemo';

const FeaturedCard = withViewTransition(Card, 'featured-card');
const InfoCard = withViewTransition(Card, 'info-card');

export function Home() {
  return (
    <main className="page">
      <h1>Home</h1>
      <p>
        Select any transition in the gallery below to navigate to the About page with
        that animation. The status bar shows live state from{' '}
        <code>useTransitionContext()</code>.
      </p>

      <TransitionGallery to="/about" />
      <DurationDemo to="/about" />

      <FeaturedCard
        title="Featured card"
        description="Uses withViewTransition(Card, 'featured-card'). The About page mounts the same view-transition-name — the browser morphs between the two snapshots. Click the Morph button above to see it."
      />
      <InfoCard
        title="Info card"
        description="view-transition-name: info-card. Unique name, no collision. For lists use withViewTransition(Card, `card-${item.id}`) per item."
      />
    </main>
  );
}
