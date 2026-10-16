# Data Model: Pantalla de Inicio de Sesión de KynWallet

**Feature**: `001-login-billetera` | **Date**: 2026-10-14

No hay persistencia: todas las entidades viven en memoria durante la sesión del navegador.

## DemoAccount (dominio)

Cuenta habilitada para la demostración. Se carga de la configuración externa (ver
[research.md R4](./research.md#r4-origen-de-las-cuentas-de-demostración)).

| Campo | Tipo | Reglas |
|---|---|---|
| `email` | string | Obligatorio, formato válido (R7), se almacena normalizado (trim + minúsculas); único en el conjunto |
| `password` | string | Obligatorio, 8–128 caracteres; NO DEBE registrarse ni mostrarse (FR-012) |
| `displayName` | string | Obligatorio, 1–80 caracteres; se muestra en la bienvenida. *Desde 002: solo letras, espacios, `'`, `.` y `-` (mismas reglas que el nombre completo del registro, 002 FR-004)* |

**Invariantes**: el conjunto tiene al menos una cuenta; los correos repetidos invalidan la
configuración (estado `unavailable`).

## LoginCredentials (dominio, valor)

Datos ingresados en el formulario.

| Campo | Tipo | Reglas de validación (FR-003, FR-004) | Mensaje |
|---|---|---|---|
| `email` | string | Vacío tras trim | "Ingresa tu correo electrónico" |
| | | No cumple el formato | "Ingresa un correo electrónico válido" |
| | | > 254 caracteres | "Ingresa un correo electrónico válido" |
| `password` | string | Vacío | "Ingresa tu contraseña" |
| | | < 8 caracteres | "La contraseña debe tener al menos 8 caracteres" |
| | | > 128 caracteres | "La contraseña no puede superar 128 caracteres" |

`validateCredentials(c) → FieldErrors` es una función pura; `{}` significa que es válido.

## AuthResult (dominio, unión discriminada)

| Variante | Datos | Origen |
|---|---|---|
| `success` | `displayName` | Correo y contraseña coinciden |
| `invalid-credentials` | — | Correo inexistente o contraseña incorrecta (indistinguibles, FR-010) |
| `unavailable` | — | Configuración ausente o inválida, o error inesperado (FR-019) |

## LoginFormState (UI, máquina de estados)

```text
              submit (con errores)
          ┌──────────────────────────┐
          ▼                          │
 ┌──────────────┐  submit (válido)  ┌┴─────────────┐
 │    editing   │──────────────────▶│  submitting  │
 └──────────────┘                   └──────┬───────┘
   ▲  ▲  ▲                    success      │  invalid / unavailable
   │  │  │          ┌────────────────┐◀────┤
   │  │  │          │    welcome     │     ▼
   │  │  │          └───────┬────────┘   ┌──────────────┐
   │  │  └── logout ────────┘            │ authError    │
   │  └──── edición de un campo ─────────┤ (mensaje)    │
   └────────────────────────────────────-└──────────────┘
```

| Campo | Tipo | Descripción |
|---|---|---|
| `status` | `'editing' \| 'submitting' \| 'authError' \| 'welcome'` | Estado actual |
| `values` | `{ email, password }` | Valores de los campos |
| `touched` | `{ email, password }` | Campo visitado (validación al salir, FR-005) |
| `fieldErrors` | `FieldErrors` | Errores visibles por campo |
| `authError` | `'invalid-credentials' \| 'unavailable' \| null` | Mensaje global |
| `welcomeName` | `string \| null` | Nombre del titular en `welcome` |
| `rememberMe` | boolean | Solo visual, no persiste (FR-017) |
| `notice` | `string \| null` | Aviso "Función no disponible en esta demostración" (FR-016) |

El estado de visibilidad de la contraseña (FR-013) es local del componente reutilizable
`PasswordField` y no forma parte de este estado.

**Transiciones clave**:

- `submit` con errores → sigue en `editing`, se marcan todos los campos como tocados y el foco
  va al primer campo con error.
- `submit` válido → `submitting` (envíos adicionales ignorados, FR-008).
- `invalid-credentials` → `authError`; se conserva el correo, se vacía la contraseña y el foco va
  a la contraseña (US2-4).
- Editar un campo en `authError` → `editing` y se limpia `authError` (US2-3).
- `success` → `welcome` con `displayName`; el foco va al mensaje de bienvenida (FR-009).
- `logout` → estado inicial con todo vacío (FR-009a).
