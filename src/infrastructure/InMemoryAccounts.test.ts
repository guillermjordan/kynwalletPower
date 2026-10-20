import { TEST_ACCOUNT } from '@/test/fixtures';
import { InMemoryAccounts } from './InMemoryAccounts';

describe('InMemoryAccounts (002 data-model.md)', () => {
  it('con configuración inválida (null) no está disponible', () => {
    expect(new InMemoryAccounts(null).isAvailable()).toBe(false);
    expect(new InMemoryAccounts([TEST_ACCOUNT]).isAvailable()).toBe(true);
  });

  it('find compara correos normalizados', () => {
    const accounts = new InMemoryAccounts([TEST_ACCOUNT]);
    expect(accounts.find('  STEVEN.Luna@Example.test ')).toEqual(TEST_ACCOUNT);
    expect(accounts.find('nadie@example.test')).toBeUndefined();
  });

  it('tras add, find devuelve la cuenta nueva', () => {
    const accounts = new InMemoryAccounts([TEST_ACCOUNT]);
    const ana = { email: 'ana@example.test', password: 'secreto-123', displayName: 'Ana' };
    accounts.add(ana);
    expect(accounts.find('ana@example.test')).toEqual(ana);
  });

  it('con null, find no encuentra ninguna cuenta', () => {
    expect(new InMemoryAccounts(null).find(TEST_ACCOUNT.email)).toBeUndefined();
  });
});
