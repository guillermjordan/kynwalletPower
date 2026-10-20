# Data Model: Pantalla de Registro de Usuarios de KynWallet

**Feature**: `002-registro-usuarios` | **Date**: 2026-10-16

No hay persistencia: todo vive en memoria y se pierde al recargar (FR-012).

## Account (dominio) — renombra `DemoAccount`

Cuenta que puede iniciar sesión. Incluye las de demostración (configuración externa, 001) y las
creadas en la visita. Se renombra `DemoAccount` → `Account` porque ya no son solo de
demostración; la forma no cambia.

| Campo | Tipo | Reglas |
|---|---|---|
| `email` | string | Formato válido, ≤ 254, normalizado (trim + minúsculas); **único** en el almacén |
| `password` | string | 8–128 caracteres, sin recortar; NO DEBE registrarse ni mostrarse (FR-019) |
| `displayName` | string | Nombre completo válido (ver `RegistrationForm.fullName`), sin espacios periféricos |

## RegistrationForm (dominio, valor)

Datos del formulario. `validateRegistration(form) → RegistrationErrors` es pura; `{}` = válido.

| Campo | Tipo | Regla (en orden) | Mensaje (`MESSAGES`) |
|---|---|---|---|
| `fullName` | string | Vacío tras trim | "Ingresa tu nombre completo" (`FULL_NAME_REQUIRED`) |
| | | > 80 caracteres tras trim | "El nombre no puede superar 80 caracteres" (`FULL_NAME_TOO_LONG`) |
| | | Caracteres fuera de letras, marcas diacríticas, espacio, `'`, `.`, `-` | "Ingresa un nombre válido" (`FULL_NAME_INVALID`) |
| `email` | string | Reglas de 001 (`validateEmail`) | `EMAIL_REQUIRED`, `EMAIL_INVALID` |
| `password` | string | Reglas de 001 (`validatePassword`) | `PASSWORD_REQUIRED`, `PASSWORD_TOO_SHORT`, `PASSWORD_TOO_LONG` |
| `passwordConfirmation` | string | Vacía | "Confirma tu contraseña" (`PASSWORD_CONFIRMATION_REQUIRED`) |
| | | Distinta de `password` (comparación exacta) | "Las contraseñas no coinciden" (`PASSWORDS_DO_NOT_MATCH`) |
| `termsAccepted` | boolean | `false` | "Debes aceptar los términos y condiciones" (`TERMS_REQUIRED`) |

Constantes del dominio: `FULL_NAME_MAX_LENGTH = 80` (también la usa `loadDemoAccounts`),
`EMAIL_MAX_LENGTH`, `PASSWORD_MIN_LENGTH` y `PASSWORD_MAX_LENGTH` (existentes).

## NewAccount (dominio, valor)

Lo que el caso de uso envía al gateway: `{ fullName, email, password }`, ya normalizado (nombre
sin espacios periféricos, correo en minúsculas). La confirmación y los términos no salen de la
UI: son reglas del formulario.

## RegistrationResult (dominio, unión discriminada)

| Variante | Datos | Origen |
|---|---|---|
| `success` | — | Cuenta agregada al almacén |
| `email-taken` | — | El correo normalizado ya existe (FR-013) |
| `unavailable` | — | Configuración ausente o inválida, o cualquier excepción (FR-023) |

El resultado nunca incluye la contraseña.

## InMemoryAccounts (infraestructura)

Almacén compartido por `InMemoryAuthGateway` e `InMemoryRegistrationGateway`.

| Operación | Comportamiento |
|---|---|
| `new InMemoryAccounts(accounts: Account[] \| null)` | `null` = configuración inválida: el almacén queda no disponible |
| `isAvailable(): boolean` | `false` si se creó con `null` |
| `find(email): Account \| undefined` | Compara correos normalizados |
| `add(account): void` | Agrega al final; quien llama verificó antes que el correo no existe |

## RegisterFormState (UI, máquina de estados)

```text
             submit (con errores)
          ┌───────────────────────┐
          ▼                       │
   ┌────────────┐ submit (válido) ┴──────────┐  success   ┌───────────────────────┐
   │  editing   │────────────────▶ submitting ├──────────▶│ onRegistered() → App   │
   └────────────┘                 └─────┬─────┘            │ guarda aviso y navega  │
        ▲                               │ email-taken /    │ a /login               │
        │ edición de un campo           ▼ unavailable      └───────────────────────┘
        │                        ┌───────────────┐
        └────────────────────────┤ registerError │
                                 └───────────────┘
```

| Campo | Tipo | Descripción |
|---|---|---|
| `status` | `'editing' \| 'submitting' \| 'registerError'` | Estado actual |
| `values` | `{ fullName, email, password, passwordConfirmation, termsAccepted }` | Valores |
| `touched` | mismo conjunto de claves → boolean | Controles visitados (FR-009) |
| `fieldErrors` | `RegistrationErrors` | Errores visibles (solo de controles tocados) |
| `registerError` | `'email-taken' \| 'unavailable' \| null` | Mensaje global |
| `notice` | `string \| null` | Aviso "Próximamente" (FR-017) |

**Transiciones clave**:

- `change` / `toggleTerms`: actualiza el valor, recalcula `fieldErrors` con todos los valores
  (la coincidencia de contraseñas se reevalúa sola, FR-007) y limpia `registerError`.
- `blur`: marca el control como tocado y recalcula `fieldErrors`.
- `submit` con errores: marca todo como tocado; sigue en `editing`; la vista lleva el foco al
  primer control con error en el orden nombre → correo → contraseña → confirmación → términos.
- `submit` válido: `submitting`; los envíos adicionales se ignoran.
- `result: email-taken | unavailable`: `registerError`; conserva nombre y correo; vacía
  contraseña y confirmación y las desmarca como tocadas (para no mostrar "obligatorio" sobre
  campos que vació el sistema). Con `email-taken` el foco va al campo de correo.
- `result: success`: el hook llama a `onRegistered()`; el formulario se desmonta al navegar.
- `showNotice`: muestra "Próximamente" sin tocar valores (US6).

Los dos controles de visibilidad de contraseña son estado local de cada `PasswordField`.

## Aviso de registro exitoso (UI, `App`)

`registrationNotice: string | null` en el estado de `App`.

- Se asigna `MESSAGES.REGISTRATION_SUCCESS` en `onRegistered`, justo antes de navegar a `/login`.
- Se pasa a `LoginForm`, que lo muestra con `Alert tone="info"` (`role=status`) bajo el título.
- Se descarta cuando `LoginForm` notifica la primera edición de un campo, o al salir de
  `/login`. Una recarga lo pierde (US1-4).
