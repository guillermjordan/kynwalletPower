import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { FormHeading } from './FormHeading';

describe('FormHeading', () => {
  it('renderiza el título como h1 y el subtítulo', () => {
    render(<FormHeading title="Crea tu cuenta" subtitle="Completa tus datos para comenzar" />);
    expect(screen.getByRole('heading', { level: 1, name: 'Crea tu cuenta' })).toBeInTheDocument();
    expect(screen.getByText('Completa tus datos para comenzar')).toBeInTheDocument();
  });

  it('FR-021: el título es enfocable por programa (tabIndex -1) y acepta un ref', () => {
    const ref = createRef<HTMLHeadingElement>();
    render(<FormHeading ref={ref} title="Crea tu cuenta" subtitle="Subtítulo" />);
    const heading = screen.getByRole('heading', { name: 'Crea tu cuenta' });
    expect(heading).toHaveAttribute('tabindex', '-1');
    ref.current?.focus();
    expect(heading).toHaveFocus();
  });
});
