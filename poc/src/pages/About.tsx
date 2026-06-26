import React from 'react';
import { withViewTransition, useTransitionNavigate } from 'view-transition-router';
import { Card } from './Card';
import { TransitionGallery } from './TransitionGallery';
import { DurationDemo } from './DurationDemo';

const AnimatedCard = withViewTransition(Card, 'featured-card');

export function About() {
  const navigate = useTransitionNavigate();

  return (
    <main className="page">
      <h1>About</h1>
      <p>
        Select any transition to navigate back to the Home page. The buttons below
        demonstrate <code>useTransitionNavigate()</code> with delta (−1) and path
        navigation.
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1, { transition: 'slide' })}>
          ← Back (slide)
        </button>
        <button onClick={() => navigate('/', { transition: 'fade' })}>
          Home (fade)
        </button>
      </div>

      <TransitionGallery to="/" />
      <DurationDemo to="/" />

      <AnimatedCard
        title="Featured card"
        description="Same view-transition-name as on Home. Use the Morph button above to see the shared-element cross-page animation."
      />
    </main>
  );
}
