import React from 'react';
import {
  createRouter,
  createRootRoute,
  createRoute,
  RouterProvider,
  Outlet,
  useRouter,
} from '@tanstack/react-router';
import { TransitionProvider, TransitionLink } from 'view-transition-router';
import type { NavigateOptions } from 'view-transition-router';
import 'view-transition-router/styles';

function RootComponent() {
  const router = useRouter();

  // Adapt TanStack Router's navigate to the library's (to, opts) signature.
  function navigate(to: string, opts?: NavigateOptions) {
    router.navigate({ to, replace: opts?.replace });
  }

  return (
    <TransitionProvider config={{ navigate }}>
      <nav>
        <TransitionLink to="/">Home</TransitionLink>
        <TransitionLink to="/about">About</TransitionLink>
      </nav>
      <Outlet />
    </TransitionProvider>
  );
}

const rootRoute = createRootRoute({ component: RootComponent });
const indexRoute = createRoute({ getParentRoute: () => rootRoute, path: '/', component: () => <div>Home</div> });
const aboutRoute = createRoute({ getParentRoute: () => rootRoute, path: '/about', component: () => <div>About</div> });

const router = createRouter({
  routeTree: rootRoute.addChildren([indexRoute, aboutRoute]),
});

export function App() {
  return <RouterProvider router={router} />;
}
