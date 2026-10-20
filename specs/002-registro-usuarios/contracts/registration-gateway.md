# Contract: RegistrationGateway (puerto de registro)

Interfaz entre la capa de aplicación y la infraestructura (Constitución 2.4, 2.5, 3.4). Es un
puerto separado de `AuthGateway`: la UI de registro no conoce la autenticación y viceversa.

```ts
// src/application/ports/RegistrationGateway.ts
export interface RegistrationGateway {
  register(account: NewAccount): Promise<RegistrationResult>;
}

// src/domain/registration.ts
export type NewAccount = { fullName: string; email: string; password: string };
export type RegistrationResult =
  | { kind: 'success' }
  | { kind: 'email-taken' }
  | { kind: 'unavailable' };

// src/application/register.ts
export type Register = (account: NewAccount) => Promise<RegistrationResult>;
export function createRegister(gateway: RegistrationGateway): Register;
```

## Caso de uso `createRegister`

| # | Dado | Resultado |
|---|---|---|
| U1 | Cualquier entrada | Llama al gateway con el correo normalizado (`normalizeEmail`) y el nombre sin espacios periféricos; la contraseña se pasa sin cambios |
| U2 | El gateway lanza una excepción o rechaza la promesa | `unavailable`; la promesa NO DEBE rechazarse |

## Comportamiento obligatorio de toda implementación del puerto

| # | Dado | Resultado |
|---|---|---|
| R1 | Correo que no existe en el almacén | `success`; la cuenta queda disponible para `AuthGateway.authenticate` en la misma visita, con `displayName = fullName` |
| R2 | Correo que ya existe (sin distinguir mayúsculas ni espacios periféricos), sea de demostración o registrado | `email-taken`; el almacén no cambia |
| R3 | Configuración de cuentas ausente o inválida | `unavailable` |
| R4 | Cualquier excepción interna | `unavailable`; la promesa NO DEBE rechazarse |
| R5 | Cualquier caso | NO DEBE registrar la contraseña ni incluirla en el resultado |
| R6 | Dos llamadas concurrentes con el mismo correo | Solo una devuelve `success` (la verificación y el alta ocurren juntas, después de la espera) |

## Implementación de la demostración

```ts
const accounts = new InMemoryAccounts(loadDemoAccounts(import.meta.env.VITE_DEMO_USERS));
const authGateway = new InMemoryAuthGateway(accounts, { delayMs? });
const registrationGateway = new InMemoryRegistrationGateway(accounts, { delayMs? });
```

- `delayMs` vale 1000 por defecto (FR-011); las pruebas usan 0 o temporizadores falsos.
- El almacén es el mismo objeto para ambos gateways: así R1 se cumple sin acoplar los adaptadores
  entre sí.
- `InMemoryAuthGateway` mantiene su contrato (`contracts/auth-gateway.md` de 001, C1–C6); solo
  cambia su constructor (recibe el almacén en lugar del arreglo).
- La configuración `VITE_DEMO_USERS` no cambia; `loadDemoAccounts` valida `displayName` con las
  reglas de nombre completo del dominio.
