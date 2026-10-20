import { visibleErrors } from './visibleErrors';

describe('visibleErrors (002 research.md R6)', () => {
  it('devuelve solo los errores de los controles tocados', () => {
    expect(
      visibleErrors(
        { email: 'Correo inválido', password: 'Contraseña corta' },
        { email: true, password: false },
      ),
    ).toEqual({ email: 'Correo inválido' });
  });

  it('sin errores devuelve {}', () => {
    expect(visibleErrors({}, { email: true, password: true })).toEqual({});
  });
});
