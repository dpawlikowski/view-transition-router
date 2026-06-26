import React from 'react';
import { TransitionLink } from 'view-transition-router';

export default function About() {
  return (
    <main>
      <h1>About</h1>
      <TransitionLink to="/" transition="slide" replace>Back to Home</TransitionLink>
    </main>
  );
}
