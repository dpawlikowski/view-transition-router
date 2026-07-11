import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { TransitionProvider, TransitionLink, DEFAULT_OUTLET_NAME, useTransitionContext } from 'view-transition-router';

function StatusBar() {
  const { direction, transitionType, isPending } = useTransitionContext();
  return (
    <div className="status-bar" data-testid="status-bar">
      direction: <strong data-testid="status-direction">{direction}</strong>
      {' · '}
      type: <strong data-testid="status-type">{transitionType ?? '—'}</strong>
      {' · '}
      pending: <strong data-testid="status-pending">{String(isPending)}</strong>
    </div>
  );
}

export function App() {
  const navigate = useNavigate();

  return (
    <TransitionProvider config={{ navigate }}>
      <header>
        <nav>
          <TransitionLink to="/" transition="slide">Home</TransitionLink>
          <TransitionLink to="/about" transition="slide">About</TransitionLink>
          <TransitionLink to="/about" transition="fade">About (fade)</TransitionLink>
        </nav>
        <StatusBar />
      </header>
      {/*
        Name the outlet via CSS `view-transition-name` (the same DEFAULT_OUTLET_NAME
        the built-in stylesheet targets) rather than <TransitionView>. React's
        experimental <ViewTransition> does not tag the *incoming* page on browser
        back/forward (popstate), so only the outgoing page animated. A plain CSS
        name is captured in both the old and new snapshots, so link clicks AND
        back/forward slide symmetrically.
      */}
      <div className="route-outlet" style={{ viewTransitionName: DEFAULT_OUTLET_NAME }}>
        <Outlet />
      </div>
    </TransitionProvider>
  );
}
