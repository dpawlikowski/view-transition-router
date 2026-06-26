import React, { useState } from 'react';
import { useTransitionNavigate } from 'view-transition-router';
import type { TransitionEasing } from 'view-transition-router';

const DURATIONS = [100, 300, 600, 1200] as const;

const EASINGS: Array<{ label: string; value: TransitionEasing }> = [
  { label: 'ease-in-out', value: 'ease-in-out' },
  { label: 'ease-in',     value: 'ease-in' },
  { label: 'ease-out',    value: 'ease-out' },
  { label: 'linear',      value: 'linear' },
];

interface DurationDemoProps {
  to: string;
}

export function DurationDemo({ to }: DurationDemoProps) {
  const navigate = useTransitionNavigate();
  const [duration, setDuration] = useState<number>(300);
  const [easing, setEasing] = useState<TransitionEasing>('ease-in-out');

  return (
    <section className="duration-demo">
      <h2 className="gallery-title">Duration &amp; Easing</h2>
      <p className="gallery-subtitle">
        Pick timing, then click <strong>Navigate</strong> to see the slide transition at that speed.
      </p>
      <div className="duration-controls">
        <div className="control-group">
          <span className="control-label">Duration</span>
          <div className="pill-row">
            {DURATIONS.map((d) => (
              <button
                key={d}
                className={`pill${duration === d ? ' pill--active' : ''}`}
                onClick={() => setDuration(d)}
              >
                {d}ms
              </button>
            ))}
          </div>
        </div>
        <div className="control-group">
          <span className="control-label">Easing</span>
          <div className="pill-row">
            {EASINGS.map(({ label, value }) => (
              <button
                key={value}
                className={`pill${easing === value ? ' pill--active' : ''}`}
                onClick={() => setEasing(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button
        className="navigate-btn"
        onClick={() => navigate(to, { transition: 'slide', duration, easing })}
      >
        Navigate → {to}
      </button>
    </section>
  );
}
