import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { App } from './App';
import { Home } from './pages/Home';
import { About } from './pages/About';
import './styles.css';

// The v7_startTransition future flag makes RouterProvider wrap every navigation
// — including popstate (browser back/forward) — in React.startTransition, which
// is what lets <ViewTransition> fire for the back/forward buttons. Without it,
// react-router@6 dispatches route updates synchronously, so only link clicks
// (which TransitionLink already wraps in startTransition) animate.
const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} future={{ v7_startTransition: true }} />
  </StrictMode>,
);
