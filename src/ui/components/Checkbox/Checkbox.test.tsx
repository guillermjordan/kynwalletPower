import { createRef, useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { expectNoA11yViolations } from '@/test/a11y';
import { Checkbox } from './Checkbox';

function Controlled() {
  const [checked, setChecked] = useState(false);
  return <Checkbox label="Recordarme" checked={checked} onChange={setChecked} />;
}

describe('Checkbox', () => {
  it('US5-2: casilla con etiqueta que alterna su estado', async () => {
    render(<Controlled />);
    const checkbox = screen.getByRole('checkbox', { name: 'Recordarme' });
    expect(checkbox).not.toBeChecked();
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
    await userEvent.click(screen.getByText('Recordarme'));
    expect(checkbox).not.toBeChecked();
  });

  it('FR-015: no tiene violaciones de accesibilidad', async () => {
    const { container } = render(<Controlled />);
    await expectNoA11yViolations(container);
  });

  it('002 FR-008: con error, la casilla queda inválida y describe el mensaje', () => {
    render(
      <Checkbox
        label="Acepto los términos"
        checked={false}
        onChange={() => {}}
        error="Debes aceptar los términos y condiciones"
      />,
    );
    const checkbox = screen.getByRole('checkbox', { name: 'Acepto los términos' });
    expect(checkbox).toHaveAttribute('aria-invalid', 'true');
    expect(checkbox).toHaveAccessibleDescription('Debes aceptar los términos y condiciones');
  });

  it('acepta una etiqueta con contenido interactivo y un ref para mover el foco', () => {
    const ref = createRef<HTMLInputElement>();
    render(
      <Checkbox
        ref={ref}
        label={
          <>
            Acepto los <button type="button">términos y condiciones</button>
          </>
        }
        checked={false}
        onChange={() => {}}
      />,
    );
    expect(
      screen.getByRole('checkbox', { name: 'Acepto los términos y condiciones' }),
    ).toBeInTheDocument();
    ref.current?.focus();
    expect(screen.getByRole('checkbox')).toHaveFocus();
  });

  it('FR-015: con error no tiene violaciones de accesibilidad', async () => {
    const { container } = render(
      <Checkbox label="Acepto" checked={false} onChange={() => {}} error="Obligatorio" />,
    );
    await expectNoA11yViolations(container);
  });
});
