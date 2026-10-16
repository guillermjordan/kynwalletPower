import type { RegistrationGateway } from './ports/RegistrationGateway';
import { createRegister } from './register';

const account = { fullName: '  Ana Pérez ', email: '  ANA@Example.test ', password: ' clave-123 ' };

describe('createRegister (contracts/registration-gateway.md)', () => {
  it('U1: normaliza correo y nombre, y pasa la contraseña sin cambios', async () => {
    const gateway: RegistrationGateway = {
      register: vi.fn().mockResolvedValue({ kind: 'success' }),
    };
    const result = await createRegister(gateway)(account);
    expect(gateway.register).toHaveBeenCalledWith({
      fullName: 'Ana Pérez',
      email: 'ana@example.test',
      password: ' clave-123 ',
    });
    expect(result).toEqual({ kind: 'success' });
  });

  it('U2: si el gateway rechaza, devuelve unavailable sin rechazar la promesa', async () => {
    const gateway: RegistrationGateway = {
      register: vi.fn().mockRejectedValue(new Error('boom')),
    };
    await expect(createRegister(gateway)(account)).resolves.toEqual({ kind: 'unavailable' });
  });

  it('U2: si el gateway lanza de forma síncrona, devuelve unavailable', async () => {
    const gateway: RegistrationGateway = {
      register: () => {
        throw new Error('boom');
      },
    };
    await expect(createRegister(gateway)(account)).resolves.toEqual({ kind: 'unavailable' });
  });
});
