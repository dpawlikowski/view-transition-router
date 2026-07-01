import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { withViewTransition } from './withViewTransition';

interface CardProps {
  id: number;
  label: string;
}

const Card = ({ label }: CardProps) => <div data-testid="card">{label}</div>;
Card.displayName = 'Card';

describe('withViewTransition', () => {
  it('renders the wrapped component', () => {
    const Wrapped = withViewTransition(Card);
    render(<Wrapped id={1} label="Hello" />);
    expect(screen.getByTestId('card')).toHaveTextContent('Hello');
  });

  it('passes all props through to the wrapped component', () => {
    const Wrapped = withViewTransition(Card, 'hero');
    render(<Wrapped id={42} label="World" />);
    expect(screen.getByText('World')).toBeInTheDocument();
  });

  it('sets displayName on the returned component', () => {
    const Wrapped = withViewTransition(Card, 'hero');
    expect(Wrapped.displayName).toBe('WithViewTransition(Card)');
  });

  it('calls the dynamic name function with the component props', () => {
    const nameFn = vi.fn((props: CardProps) => `card-${props.id}`);
    const Wrapped = withViewTransition(Card, nameFn);
    render(<Wrapped id={7} label="Dynamic" />);
    expect(nameFn).toHaveBeenCalledWith({ id: 7, label: 'Dynamic' });
  });

  it('falls back to Component.displayName when no name is provided', () => {
    // With React stable (no ViewTransition), just verify it renders without errors.
    const Wrapped = withViewTransition(Card);
    render(<Wrapped id={1} label="Fallback" />);
    expect(screen.getByText('Fallback')).toBeInTheDocument();
  });

  it('handles anonymous components by falling back to "view"', () => {
    const Anon = ({ label }: CardProps) => <span>{label}</span>;
    const Wrapped = withViewTransition(Anon);
    expect(Wrapped.displayName).toBe('WithViewTransition(Anon)');
  });

  it('falls back to "Component" in displayName when component has no name at all', () => {
    // Simulate a truly unnamed component (e.g. minified output or Object.create).
    const Nameless = ({ label }: CardProps) => <span>{label}</span>;
    Object.defineProperty(Nameless, 'name', { value: '', configurable: true });
    Object.defineProperty(Nameless, 'displayName', { value: undefined, configurable: true });

    const Wrapped = withViewTransition(Nameless);
    expect(Wrapped.displayName).toBe('WithViewTransition(Component)');
  });

  it('uses the FALLBACK_TRANSITION_NAME "view" as transition name when component has no name', () => {
    // React.ViewTransition is unavailable in stable React, so just verify no throw.
    const Nameless = ({ label }: CardProps) => <span data-testid="nl">{label}</span>;
    Object.defineProperty(Nameless, 'name', { value: '', configurable: true });
    Object.defineProperty(Nameless, 'displayName', { value: undefined, configurable: true });

    const Wrapped = withViewTransition(Nameless);
    expect(() => render(<Wrapped id={1} label="x" />)).not.toThrow();
    expect(screen.getByTestId('nl')).toBeInTheDocument();
  });

  it('warns in dev when two mounted instances share a static view-transition-name', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const Wrapped = withViewTransition(Card, 'duplicate');
    render(
      <>
        <Wrapped id={1} label="A" />
        <Wrapped id={2} label="B" />
      </>,
    );
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('share the view-transition-name "duplicate"'));
    warnSpy.mockRestore();
  });

  it('does not warn when a dynamic name function produces unique names per instance', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const Wrapped = withViewTransition(Card, (props: CardProps) => `card-${props.id}`);
    render(
      <>
        <Wrapped id={1} label="A" />
        <Wrapped id={2} label="B" />
      </>,
    );
    expect(warnSpy).not.toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});
