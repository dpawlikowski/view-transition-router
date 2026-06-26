import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { TransitionProvider, TransitionLink, TransitionView, useTransitionContext } from 'view-transition-router';

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
      <TransitionView>
        <Outlet />
      </TransitionView>
    </TransitionProvider>
  );
}
