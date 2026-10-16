import { render, screen } from '@testing-library/react';
import { FormFooter } from './FormFooter';

describe('FormFooter', () => {
  it('muestra la pregunta seguida del enlace a la otra pantalla', () => {
    render(<FormFooter question="¿Ya tienes cuenta?" linkLabel="Inicia sesión" to="/login" />);
    const link = screen.getByRole('link', { name: 'Inicia sesión' });
    expect(link).toHaveAttribute('href', '/login');
    expect(link.parentElement).toHaveTextContent('¿Ya tienes cuenta?Inicia sesión');
  });
});
