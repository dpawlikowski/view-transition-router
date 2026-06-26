import React from 'react';
import { useTransitionNavigate } from 'view-transition-router';
import type { TransitionType } from 'view-transition-router';

interface TransitionEntry {
  type: TransitionType;
  label: string;
  description: string;
}

const TRANSITIONS: TransitionEntry[] = [
  { type: 'slide',      label: 'Slide',       description: 'Horizontal push, direction-aware' },
  { type: 'fade',       label: 'Fade',        description: 'Cross-dissolve opacity' },
  { type: 'zoom',       label: 'Zoom',        description: 'Scale in / out' },
  { type: 'slide-up',   label: 'Slide Up',    description: 'Enter from bottom, exit up' },
  { type: 'slide-down', label: 'Slide Down',  description: 'Enter from top, exit down' },
  { type: 'flip',       label: 'Flip',        description: '3D Y-axis card flip' },
  { type: 'blur',       label: 'Blur',        description: 'Blur + opacity cross-fade' },
  { type: 'reveal',     label: 'Reveal',      description: 'Clip-path wipe from right' },
  { type: 'rotate',     label: 'Rotate',      description: 'Slight rotation + scale' },
  { type: 'morph',      label: 'Morph',       description: 'Shared-element (card morphs)' },
  { type: 'none',       label: 'None',        description: 'Instant — no animation' },
];

interface TransitionGalleryProps {
  /** Path to navigate to when a transition type is selected. */
  to: string;
}

export function TransitionGallery({ to }: TransitionGalleryProps) {
  const navigate = useTransitionNavigate();

  return (
    <section className="gallery">
      <h2 className="gallery-title">Transition gallery</h2>
      <p className="gallery-subtitle">
        Click any card to navigate to <code>{to}</code> with that transition.
      </p>
      <div className="transition-grid">
        {TRANSITIONS.map(({ type, label, description }) => (
          <button
            key={type}
            className="transition-btn"
            onClick={() => navigate(to, { transition: type })}
            data-transition={type}
          >
            <span className="transition-btn-label">{label}</span>
            <code className="transition-btn-type">{type}</code>
            <span className="transition-btn-desc">{description}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
