import React from 'react';
import { TransitionLink } from 'view-transition-router';

export default function Home() {
  return (
    <main>
      <h1>Home</h1>
      <TransitionLink to="/about" transition="slide">Go to About</TransitionLink>
    </main>
  );
}
