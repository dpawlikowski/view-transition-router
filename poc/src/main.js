import { jsx as _jsx } from "react/jsx-runtime";
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { App } from './App';
import { Home } from './pages/Home';
import { About } from './pages/About';
import './styles.css';
// createBrowserRouter + RouterProvider wraps every navigation (including popstate)
// in React.startTransition, which lets <ViewTransition> fire for back/forward buttons.
// BrowserRouter uses synchronous dispatch and doesn't trigger ViewTransition on popstate.
const router = createBrowserRouter([
    {
        path: '/',
        element: _jsx(App, {}),
        children: [
            { index: true, element: _jsx(Home, {}) },
            { path: 'about', element: _jsx(About, {}) },
        ],
    },
]);
createRoot(document.getElementById('root')).render(_jsx(StrictMode, { children: _jsx(RouterProvider, { router: router }) }));
