import { TEST_ACCOUNT, TEST_REGISTRATION } from '@/test/fixtures';
import { InMemoryAccounts } from './InMemoryAccounts';
import { InMemoryAuthGateway } from './InMemoryAuthGateway';
import { InMemoryRegistrationGateway } from './InMemoryRegistrationGateway';

function setup(accounts: InMemoryAccounts = new InMemoryAccounts([TEST_ACCOUNT])) {
  return {
    accounts,
    registration: new InMemoryRegistrationGateway(accounts, { delayMs: 0 }),
    auth: new InMemoryAuthGateway(accounts, { delayMs: 0 }),
  };
}

describe('InMemoryRegistrationGateway (contracts/registration-gateway.md)', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('R1: correo nuevo → success y la cuenta puede iniciar sesión con su nombre', async () => {
    const { registration, auth } = setup();
    await expect(registration.register(TEST_REGISTRATION)).resolves.toEqual({ kind: 'success' });
    await expect(
      auth.authenticate({ email: TEST_REGISTRATION.email, password: TEST_REGISTRATION.password }),
    ).resolves.toEqual({ kind: 'success', displayName: TEST_REGISTRATION.fullName });
  });

  it.each([
    ['de demostración', TEST_ACCOUNT.email],
    ['con mayúsculas y espacios', `  ${TEST_ACCOUNT.email.toUpperCase()} `],
  ])('R2: correo ya registrado (%s) → email-taken y el almacén no cambia', async (_, email) => {
    const { registration, auth } = setup();
    await expect(registration.register({ ...TEST_REGISTRATION, email })).resolves.toEqual({
      kind: 'email-taken',
    });
    await expect(
      auth.authenticate({ email: TEST_ACCOUNT.email, password: TEST_ACCOUNT.password }),
    ).resolves.toEqual({ kind: 'success', displayName: TEST_ACCOUNT.displayName });
  });

  it('R2: un correo registrado en la misma visita también está tomado', async () => {
    const { registration } = setup();
    await registration.register(TEST_REGISTRATION);
    await expect(registration.register(TEST_REGISTRATION)).resolves.toEqual({
      kind: 'email-taken',
    });
  });

  it('R3: almacén no disponible → unavailable', async () => {
    const { registration } = setup(new InMemoryAccounts(null));
    await expect(registration.register(TEST_REGISTRATION)).resolves.toEqual({
      kind: 'unavailable',
    });
  });

  it('R4: una excepción interna → unavailable sin rechazar la promesa', async () => {
    const accounts = new InMemoryAccounts([TEST_ACCOUNT]);
    vi.spyOn(accounts, 'find').mockImplementation(() => {
      throw new Error('boom');
    });
    const { registration } = setup(accounts);
    await expect(registration.register(TEST_REGISTRATION)).resolves.toEqual({
      kind: 'unavailable',
    });
  });

  it('R5: el resultado nunca contiene la contraseña', async () => {
    const { registration } = setup();
    const result = await registration.register(TEST_REGISTRATION);
    expect(JSON.stringify(result)).not.toContain(TEST_REGISTRATION.password);
  });

  it('R6: dos registros concurrentes con el mismo correo → solo uno es success', async () => {
    const { registration } = setup();
    const results = await Promise.all([
      registration.register(TEST_REGISTRATION),
      registration.register({ ...TEST_REGISTRATION, email: TEST_REGISTRATION.email.toUpperCase() }),
    ]);
    expect(results.filter((result) => result.kind === 'success')).toHaveLength(1);
  });

  it('FR-011: espera 1000 ms por defecto antes de responder', async () => {
    vi.useFakeTimers();
    const onResolve = vi.fn();
    void new InMemoryRegistrationGateway(new InMemoryAccounts([TEST_ACCOUNT]))
      .register(TEST_REGISTRATION)
      .then(onResolve);
    await vi.advanceTimersByTimeAsync(999);
    expect(onResolve).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(onResolve).toHaveBeenCalledOnce();
  });
});
