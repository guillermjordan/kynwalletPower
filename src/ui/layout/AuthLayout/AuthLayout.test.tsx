import { render, screen } from '@testing-library/react';
import { AuthLayout } from './AuthLayout';

const brand = { title: ['Tu dinero,', 'sin fronteras.'], subtitle: 'Texto de apoyo' };

describe('AuthLayout (002 research.md R8)', () => {
  it('renderiza el panel de marca y el contenido dentro de <main>', () => {
    render(
      <AuthLayout brand={brand} mobileBrand="logo">
        <p>Formulario</p>
      </AuthLayout>,
    );
    expect(screen.getByRole('main')).toHaveTextContent('Formulario');
    expect(screen.getByText('sin fronteras.')).toBeInTheDocument();
  });

  it.each(['logo', 'hidden'] as const)('refleja mobileBrand="%s"', (mobileBrand) => {
    const { container } = render(
      <AuthLayout brand={brand} mobileBrand={mobileBrand}>
        <p>Formulario</p>
      </AuthLayout>,
    );
    expect(container.firstElementChild).toHaveAttribute('data-mobile-brand', mobileBrand);
  });
});
