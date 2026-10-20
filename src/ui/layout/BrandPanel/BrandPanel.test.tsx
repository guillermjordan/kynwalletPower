import { render, screen } from '@testing-library/react';
import { BrandPanel } from './BrandPanel';

const props = {
  title: ['Comienza tu', 'camino financiero.'],
  subtitle: 'Crea tu cuenta en minutos.',
};

describe('BrandPanel', () => {
  it('FR-001: muestra el logo, cada línea del titular y el texto de apoyo recibidos', () => {
    render(<BrandPanel {...props} />);
    expect(screen.getByText('KynWallet')).toBeInTheDocument();
    expect(screen.getByText('Comienza tu')).toBeInTheDocument();
    expect(screen.getByText('camino financiero.')).toBeInTheDocument();
    expect(screen.getByText('Crea tu cuenta en minutos.')).toBeInTheDocument();
  });

  it('la tarjeta ilustrativa es decorativa', () => {
    const { container } = render(<BrandPanel {...props} />);
    expect(container.querySelector('.card')).toHaveAttribute('aria-hidden', 'true');
  });

  it('research.md R7: la variante register aplica el degradado del registro', () => {
    const { container, rerender } = render(<BrandPanel {...props} />);
    expect(container.firstElementChild).not.toHaveClass('register');
    rerender(<BrandPanel {...props} variant="register" />);
    expect(container.firstElementChild).toHaveClass('register');
  });
});
