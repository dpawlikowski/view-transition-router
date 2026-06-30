import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createHashRouter, RouterProvider } from 'react-router-dom';
import { App } from './App';
import { Home } from './pages/Home';
import { About } from './pages/About';
import './styles.css';

// createBrowserRouter + RouterProvider wraps every navigation (including popstate)
// in React.startTransition, which lets <ViewTransition> fire for back/forward buttons.
// BrowserRouter uses synchronous dispatch and doesn't trigger ViewTransition on popstate.
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
    <RouterProvider router={router} />
  </StrictMode>,
);
