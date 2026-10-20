import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { createAuthenticate } from '@/application/authenticate';
import { createRegister } from '@/application/register';
import { InMemoryAccounts } from '@/infrastructure/InMemoryAccounts';
import { InMemoryAuthGateway } from '@/infrastructure/InMemoryAuthGateway';
import { InMemoryRegistrationGateway } from '@/infrastructure/InMemoryRegistrationGateway';
import { loadDemoAccounts } from '@/infrastructure/loadDemoAccounts';
import '@/ui/styles/tokens.css';
import '@/ui/styles/global.css';
import { App } from './App';

// Raíz de composición: único lugar que conoce las implementaciones concretas (Constitución 2.5).
// Un único almacén: las cuentas registradas pueden iniciar sesión en la misma visita (002 FR-012).
const accounts = new InMemoryAccounts(loadDemoAccounts(import.meta.env.VITE_DEMO_USERS));
const authenticate = createAuthenticate(new InMemoryAuthGateway(accounts));
const register = createRegister(new InMemoryRegistrationGateway(accounts));

const root = document.getElementById('root');
if (root) {
  createRoot(root).render(
    <StrictMode>
      <App authenticate={authenticate} register={register} />
    </StrictMode>,
  );
}
