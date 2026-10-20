import { useRef } from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link } from './Link';
import { PATHS } from './paths';
import { navigate, useRoute } from './router';

function CurrentRoute() {
  return <p data-testid="route">{useRoute()}</p>;
}

const route = () => screen.getByTestId('route');

/** Registra si el clic llegó al documento ya cancelado y evita la navegación real de jsdom. */
function captureDefaultPrevented() {
  const seen: boolean[] = [];
  const listener = (event: Event) => {
    seen.push(event.defaultPrevented);
    event.preventDefault();
  };
  document.addEventListener('click', listener);
  return { seen, stop: () => document.removeEventListener('click', listener) };
}

describe('routing (002 research.md R2, FR-002)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', PATHS.login);
  });

  it('FR-002: las rutas son /login y /registro', () => {
    expect(PATHS).toEqual({ login: '/login', register: '/registro' });
  });

  it.each(['/', '/cualquier-cosa'])(
    'US3-5: "%s" se reemplaza por /login sin agregar entradas al historial',
    (pathname) => {
      window.history.replaceState(null, '', pathname);
      const length = window.history.length;
      render(<CurrentRoute />);
      expect(route()).toHaveTextContent('/login');
      expect(window.location.pathname).toBe('/login');
      expect(window.history.length).toBe(length);
    },
  );

  it('US3-4: una dirección conocida se respeta en la carga inicial', () => {
    window.history.replaceState(null, '', PATHS.register);
    render(<CurrentRoute />);
    expect(route()).toHaveTextContent('/registro');
  });

  it('navigate agrega una entrada al historial y actualiza la ruta', () => {
    render(<CurrentRoute />);
    const length = window.history.length;
    act(() => navigate(PATHS.register));
    expect(route()).toHaveTextContent('/registro');
    expect(window.location.pathname).toBe('/registro');
    expect(window.history.length).toBe(length + 1);
  });

  it('US3-3: atrás y adelante actualizan la ruta (popstate)', async () => {
    render(<CurrentRoute />);
    act(() => navigate(PATHS.register));
    act(() => window.history.back());
    await waitFor(() => expect(route()).toHaveTextContent('/login'));
    act(() => window.history.forward());
    await waitFor(() => expect(route()).toHaveTextContent('/registro'));
  });

  it('Link es un enlace real que navega sin recargar', async () => {
    const capture = captureDefaultPrevented();
    render(
      <>
        <Link to={PATHS.register}>Ir al registro</Link>
        <CurrentRoute />
      </>,
    );
    const link = screen.getByRole('link', { name: 'Ir al registro' });
    expect(link).toHaveAttribute('href', '/registro');
    await userEvent.click(link);
    expect(route()).toHaveTextContent('/registro');
    expect(capture.seen).toEqual([true]);
    capture.stop();
  });

  it('Link no intercepta clics con Ctrl o Meta (abrir en otra pestaña)', () => {
    const capture = captureDefaultPrevented();
    render(
      <>
        <Link to={PATHS.register}>Ir al registro</Link>
        <CurrentRoute />
      </>,
    );
    const link = screen.getByRole('link', { name: 'Ir al registro' });
    fireEvent.click(link, { ctrlKey: true });
    fireEvent.click(link, { metaKey: true });
    expect(capture.seen).toEqual([false, false]);
    expect(route()).toHaveTextContent('/login');
    capture.stop();
  });
});

describe('useFocusOnNavigation (FR-021, research.md R10)', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', PATHS.login);
  });

  it('enfoca el título solo si se llegó por navegación interna, no en la carga inicial', async () => {
    // Módulo nuevo: simula la carga inicial de la aplicación, sin navegaciones previas.
    vi.resetModules();
    const router = await import('./router');

    function Title({ text }: { text: string }) {
      const ref = useRef<HTMLHeadingElement>(null);
      router.useFocusOnNavigation(ref);
      return (
        <h1 ref={ref} tabIndex={-1}>
          {text}
        </h1>
      );
    }

    const { unmount } = render(<Title text="Carga inicial" />);
    expect(screen.getByRole('heading', { name: 'Carga inicial' })).not.toHaveFocus();
    unmount();

    act(() => router.navigate(PATHS.register));
    render(<Title text="Después de navegar" />);
    expect(screen.getByRole('heading', { name: 'Después de navegar' })).toHaveFocus();
  });
});
