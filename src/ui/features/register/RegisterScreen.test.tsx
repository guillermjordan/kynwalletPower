import { render, screen } from '@testing-library/react';
import { expectNoA11yViolations } from '@/test/a11y';
import { createRegisterStub } from '@/test/registerStub';
import { RegisterScreen } from './RegisterScreen';

const renderScreen = () =>
  render(<RegisterScreen register={createRegisterStub().register} onRegistered={() => {}} />);

describe('RegisterScreen (FR-001, frame 04 · Registro)', () => {
  it('FR-001: título, subtítulo y textos de marca propios del registro', () => {
    renderScreen();
    expect(screen.getByRole('heading', { level: 1, name: 'Crea tu cuenta' })).toBeInTheDocument();
    expect(screen.getByText('Completa tus datos para comenzar')).toBeInTheDocument();
    expect(screen.getByText('Comienza tu')).toBeInTheDocument();
    expect(screen.getByText('camino financiero.')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Crea tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde cualquier lugar.',
      ),
    ).toBeInTheDocument();
  });

  it('US5-2: en móvil se muestra solo el formulario', () => {
    const { container } = renderScreen();
    expect(container.firstElementChild).toHaveAttribute('data-mobile-brand', 'hidden');
  });

  it('FR-021: no tiene violaciones de accesibilidad', async () => {
    const { container } = renderScreen();
    await expectNoA11yViolations(container);
  });
});
