import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TransitionView } from './TransitionView';
import { DEFAULT_OUTLET_NAME } from '../constants';

describe('TransitionView', () => {
  it('renders children when React.ViewTransition is unavailable (stable React)', () => {
    render(
      <TransitionView>
        <span data-testid="child">content</span>
      </TransitionView>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('accepts a custom name prop without breaking', () => {
    render(
      <TransitionView name="my-outlet">
        <span data-testid="child">content</span>
      </TransitionView>,
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('DEFAULT_OUTLET_NAME is the string vtr-page', () => {
    expect(DEFAULT_OUTLET_NAME).toBe('vtr-page');
  });
});
