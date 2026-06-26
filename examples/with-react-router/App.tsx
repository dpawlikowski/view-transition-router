import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { TransitionProvider, TransitionLink } from 'view-transition-router';
import 'view-transition-router/styles';

// useNavigate must be called inside <BrowserRouter>, so we split the app.
function AppContent() {
  const navigate = useNavigate();

  return (
    <TransitionProvider config={{ navigate }}>
      <nav>
        <TransitionLink to="/" transition="slide">Home</TransitionLink>
        <TransitionLink to="/about" transition="slide">About</TransitionLink>
        <TransitionLink to="/settings" transition="fade">Settings</TransitionLink>
      </nav>
      <Routes>
        <Route path="/" element={<div>Home</div>} />
        <Route path="/about" element={<div>About</div>} />
        <Route path="/settings" element={<div>Settings</div>} />
      </Routes>
    </TransitionProvider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
