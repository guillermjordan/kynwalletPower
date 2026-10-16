# Implementation Plan: Pantalla de Registro de Usuarios de KynWallet

**Branch**: `002-registro-usuarios` (trabajo en `feature/registro-guillermo-jordan`) | **Date**: 2026-10-16 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-registro-usuarios/spec.md`

## Summary

Pantalla de registro en `/registro`, fiel al frame de Figma `04 · Registro` (nodo `31:2`), con
nombre completo, correo, contraseña, confirmación y aceptación de términos, validación en línea y
registro simulado en memoria. Un registro exitoso vuelve a `/login` con un aviso, y la cuenta
creada puede iniciar sesión durante la visita.

El enfoque replica el módulo de login:

- **Dominio**: reglas puras que reutilizan las del login.
- **Aplicación**: puerto `RegistrationGateway` y caso de uso `createRegister`.
- **Infraestructura**: un almacén de cuentas en memoria compartido por el gateway de
  autenticación existente y un nuevo gateway de registro.
- **UI**: reducer + hook + CSS Modules, componentes y layout del login generalizados.

Se agrega un router mínimo propio sobre la History API (sin dependencias nuevas) y los tokens de
tipografía y espaciado extraídos del frame.

## Technical Context

**Language/Version**: TypeScript 5.x (`strict`), Node.js ≥ 20 LTS para herramientas (sin cambios)

**Primary Dependencies**: React 19, Vite 8, `@fontsource-variable/inter`. **Sin dependencias
nuevas** (routing propio, research R2)

**Storage**: N/A. Cuentas en memoria (`InMemoryAccounts`), se pierden al recargar

**Testing**: Vitest 5, React Testing Library, `user-event`, jsdom, `axe-core` (helper
`src/test/a11y.ts`), `@vitest/coverage-v8` (umbral 80 %)

**Target Platform**: navegadores modernos, de 320px a escritorio

**Project Type**: SPA solo frontend (misma app que 001)

**Performance Goals**: resultado del envío en ≤ 2 s (SC-002) con espera simulada de 1 s

**Constraints**: sin backend; WCAG 2.1 AA; sin credenciales versionadas; nada sensible en la
URL ni en el almacenamiento del navegador; sin scroll horizontal desde 320px

**Scale/Scope**: 1 pantalla nueva, 2 rutas, ~6 módulos nuevos y ~8 modificados

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principio / Regla | Cumplimiento en el diseño | Estado |
|---|---|---|
| I. TDD | Cada historia empieza con pruebas que fallan: dominio → caso de uso → adaptadores → reducer → componentes → `App`. Las pruebas de 001 afectadas (US5-1 "Regístrate", constructor del gateway) se actualizan **antes** de cambiar el código | ✅ |
| II. SOLID | SRP: almacén, gateway de auth y gateway de registro separados. ISP: `RegistrationGateway` es un puerto aparte de `AuthGateway`. DIP: `App` recibe `authenticate` y `register` por props desde `main.tsx`. O/C: ver Complexity Tracking (cambios en módulos estables) | ⚠️ justificado |
| III. Clean Architecture | `domain/registration.ts` sin React; `application/` depende solo del dominio; `ui/routing` vive en `ui/` y no importa infraestructura; las reglas ESLint de capas existentes cubren los archivos nuevos | ✅ |
| IV. DRY/KISS/YAGNI | Reutiliza `validateEmail`/`validatePassword`, `MESSAGES`, componentes, layout y tokens; `visibleErrors` compartido por ambos reducers; `FULL_NAME_MAX_LENGTH` único; router de ~60 líneas en vez de una librería | ✅ |
| V. Seguridad | Validación en el límite (UI con reglas del dominio); contraseña nunca en URL, logs ni almacenamiento del navegador; aviso de éxito en memoria (R3); errores sin detalles internos. **Desviación 5.4**: "Ya existe una cuenta con este correo" revela si un correo existe | ⚠️ desviación aprobada en la spec (Clarifications 2026-10-16) |
| 5.5 Eventos de seguridad registrados | No hay registro estructurado de eventos de seguridad (registro rechazado o fallido, login fallido): la app es solo cliente y no tiene adónde enviarlos. Errores manejados explícitamente y sin detalles internos (esta parte sí se cumple) | ⚠️ excepción temporal 9.1 (Complexity Tracking) |
| VI. BRD/ARD | No existen (supuesto de la spec) | ✅ N/A |
| 7. Dependencias | Ninguna nueva; `react-router` evaluado y descartado (R2) | ✅ |
| 8.1 Pruebas | Unitarias (dominio, caso de uso, almacén, gateways, reducer, router) e integración (formulario, `App` con rutas); axe en registro, login con aviso y errores | ✅ |
| 8.2 Convenciones | ESLint + Prettier + `tsc --noEmit` sin cambios de configuración | ✅ |
| 8.3 Documentación | Contratos nuevos; quickstart con la regla de reescritura para hosting; README actualizado con las rutas | ✅ |
| 8.4 Accesibilidad AA | Mismos tokens accesibles que 001; foco al cambiar de pantalla; errores y avisos anunciados; nombre accesible de la casilla incluye el enlace | ✅ |
| 8.6 Sistema de diseño | Tokens de Figma; colores accesibles derivados (heredados de 001) y degradado nuevo pendientes de aprobación | ⚠️ pendiente de aprobación de diseño |
| 8.7 Observabilidad | Sin logs estructurados ni métricas, por el mismo motivo que 5.5; `no-console` sigue activo para que no se filtren datos sensibles | ⚠️ excepción temporal 9.1 (Complexity Tracking) |
| 9.2 Trazabilidad | Pruebas con prefijo de escenario o requisito (`US2-4`, `FR-013`, `R2`); la spec 001 se anota con la referencia a 002 FR-016 | ✅ |
| 9.4 Controles | `npm run verify` sin cambios | ✅ |

**Resultado del gate**: APROBADO con desviaciones justificadas (ver Complexity Tracking).
Ninguna violación queda sin justificar. La excepción de 5.5 y 8.7 está **pendiente de aprobación**
del responsable técnico (9.1) y DEBE aprobarse antes de integrar el PR.

> Corrección del 2026-10-16 (`/speckit.analyze`, hallazgo C1): la primera versión del gate no
> evaluaba 5.5 (registro de eventos de seguridad) ni 8.7 (observabilidad). El plan de 001 tiene el
> mismo hueco; la excepción de abajo cubre a toda la app, incluido el login.

**Re-check post-diseño (Phase 1)**: data-model y contratos mantienen las conclusiones. No se
agregaron capas ni dependencias. El único acoplamiento nuevo entre features (aviso de registro en
el login) pasa por `App` mediante props, sin que `LoginForm` conozca el registro.

## Project Structure

### Documentation (this feature)

```text
specs/002-registro-usuarios/
├── plan.md                        # Este archivo
├── research.md                    # Phase 0
├── data-model.md                  # Phase 1
├── quickstart.md                  # Phase 1
├── contracts/
│   ├── registration-gateway.md    # Puerto de registro, caso de uso y almacén
│   └── ui-register.md             # Rutas, vista de registro y cambios en el login
├── checklists/
│   └── requirements.md
└── tasks.md                       # Phase 2 (/speckit-tasks)
```

### Source Code (repository root)

`+` nuevo · `~` modificado · `→` movido o renombrado

```text
src/
├── main.tsx                         ~ crea InMemoryAccounts, ambos gateways y ambos casos de uso
├── App.tsx                          ~ elige la pantalla según la ruta; guarda el aviso de registro
├── domain/
│   ├── auth.ts                      ~ DemoAccount → Account
│   ├── registration.ts              + RegistrationForm, NewAccount, RegistrationResult
│   ├── validation.ts                ~ exporta validateEmail/validatePassword; validateRegistration,
│   │                                  validateFullName, FULL_NAME_MAX_LENGTH
│   └── messages.ts                  ~ mensajes del registro
├── application/
│   ├── ports/RegistrationGateway.ts + puerto
│   └── register.ts                  + caso de uso createRegister
├── infrastructure/
│   ├── InMemoryAccounts.ts          + almacén compartido
│   ├── simulateLatency.ts           + espera simulada (extraída de InMemoryAuthGateway)
│   ├── InMemoryAuthGateway.ts       ~ recibe el almacén
│   ├── InMemoryRegistrationGateway.ts + adaptador de registro
│   └── loadDemoAccounts.ts          ~ usa FULL_NAME_MAX_LENGTH / isValidFullName
├── ui/
│   ├── styles/
│   │   ├── tokens.css               ~ tipografía, espaciados, medidas, --brand-gradient-register
│   │                                  (colores, radios y alturas ya existen: research R7)
│   │   └── textLink.module.css      + estilo de enlace compartido (Button link y Link)
│   ├── routing/                     + paths.ts, router.ts (navigate, useRoute,
│   │                                  useFocusOnNavigation), Link.tsx
│   ├── forms/visibleErrors.ts       + errores visibles solo de controles tocados
│   ├── components/
│   │   ├── Checkbox/                ~ label ReactNode; error y ref opcionales
│   │   └── Button/Button.module.css ~ .link compone textLink
│   ├── layout/
│   │   ├── AuthLayout/              → generaliza features/login/LoginScreen (panel + formulario)
│   │   └── BrandPanel/              ~ titular, texto de apoyo, degradado y modo móvil por props
│   └── features/
│       ├── login/
│       │   ├── LoginForm.tsx        ~ "Regístrate" como Link; aviso de registro; foco del h1
│       │   ├── loginReducer.ts      ~ usa visibleErrors
│       │   └── LoginScreen.*        → eliminado (reemplazado por AuthLayout)
│       └── register/                + RegisterScreen, RegisterForm, registerReducer,
│                                      useRegisterForm, RegisterForm.module.css
└── test/
    ├── fixtures.ts                  ~ datos de registro ficticios
    └── registerStub.ts              + caso de uso de registro falso (como authStub)
```

**Structure Decision**: el mismo proyecto único de frontend de 001, con capas por carpeta y
pruebas junto al código. Lo nuevo de UI que no pertenece a una feature (routing, helpers de
formulario, layout de autenticación) va en carpetas de `ui/` compartidas, para que ni el login ni
el registro dependan uno del otro.

## Complexity Tracking

| Violación / desviación | Por qué es necesaria | Alternativa más simple rechazada porque |
|---|---|---|
| Mensaje "Ya existe una cuenta con este correo" (enumeración de cuentas, Constitución 5.4) | Decisión del usuario en Clarifications 2026-10-16: demo solo-cliente con cuentas ficticias; prioriza que el usuario sepa cómo continuar | Un mensaje genérico no evita la enumeración: el comportamiento sigue siendo distinto (un correo nuevo navega a `/login`, uno existente no). La única opción indistinguible es responder con el mismo éxito sin crear la cuenta, que deja sin acceso con la contraseña nueva a quien ya tenía cuenta. Se reevaluó el 2026-10-16 y se mantiene el mensaje específico; se reconsidera si la app maneja cuentas reales (con verificación por correo, hoy fuera de alcance) |
| Modificar módulos estables de 001 (2.2 O/C): constructor de `InMemoryAuthGateway`, props de `BrandPanel` y `Checkbox`, `LoginScreen` → `AuthLayout`, "Regístrate" en `LoginForm` | Compartir cuentas entre login y registro, y reutilizar layout y componentes en lugar de duplicarlos (4.1, 8.5). Los cambios de props son opcionales y compatibles; el contrato `AuthGateway` no cambia | Duplicar `BrandPanel`, `LoginScreen` y `Checkbox` para el registro viola 4.1; un gateway de registro con su propio arreglo incumple FR-012 (la cuenta nueva no podría iniciar sesión) |
| Router propio en lugar de una librería | Cumple FR-002 sin dependencias (7.4, 4.2) | `react-router` agrega una dependencia de runtime cuyo valor diferencial no responde a ningún requisito |
| Degradado del panel distinto al del login (`--brand-gradient-register`) | Así está en el frame (R7). **Requiere confirmación de diseño (8.6)** | Usar el degradado del login se aparta del frame sin aprobación |
| **Excepción temporal 9.1**: sin registro estructurado de eventos de seguridad (5.5) ni logs y métricas de observabilidad (8.7), para login y registro. **Vence**: el 2027-03-31 o cuando la app incorpore un backend, lo que ocurra primero. **Aprueba**: responsable técnico del proyecto, *pendiente*. **Plan de adecuación**: al vencer, puerto `SecurityEventLog` en `application/` con eventos sin datos personales (registro rechazado, registro fallido, login fallido) y un adaptador hacia el sistema de logs y métricas corporativo | Una app solo cliente no tiene un destino para logs ni métricas; escribir en la consola del navegador no es trazable ni centralizado, y exige desactivar `no-console`, que hoy protege contra la filtración de datos sensibles | Implementar ahora un puerto con un adaptador de consola agrega código y una excepción de ESLint sin cumplir el objetivo de 5.5 y 8.7 (trazabilidad centralizada), y las métricas seguirían sin destino (YAGNI, 4.3) |
| Colores accesibles en lugar de los del frame (heredado de 001 R3) | 8.4 es OBLIGATORIA | Reproducir los colores exactos incumple 8.4 y SC-005 |

## Implementation Notes

- **Orden sugerido** (cada paso en TDD):
  1. Tokens y refactor del CSS del login.
  2. Dominio.
  3. Caso de uso.
  4. Almacén y gateways, adaptando primero las pruebas de `InMemoryAuthGateway`.
  5. Routing.
  6. `AuthLayout` y `BrandPanel`.
  7. `Checkbox`.
  8. Registro (reducer → hook → formulario).
  9. Cambios del login.
  10. `App` y `main.tsx`.
  11. Pruebas de accesibilidad de pantalla completa.
- **Pruebas de 001 que cambian**: `LoginForm.test.tsx` (US5-1 para "Regístrate" pasa a verificar
  el enlace), `InMemoryAuthGateway.test.ts` (constructor) y `App.test.tsx` (props `register` y
  ruta inicial). En jsdom, cada prueba de rutas restablece `window.history` a `/login`.
- **Texto de carga** "Creando cuenta…": no figura en el frame; se define por analogía con
  "Iniciando sesión…".
- **Trazabilidad con 001**: agregar una nota en `specs/001-login-billetera/spec.md` (FR-016 y
  US5-1) que indique que "Regístrate" pasa a navegar a `/registro` según 002 FR-016.

## Implementation Notes (2026-10-16)

- **Finales de línea**: la línea de base (T001) fallaba en `npm run format` porque el checkout en
  Windows (`core.autocrlf=true`) convertía los archivos a CRLF. Se agregó `.gitattributes`
  (`* text=auto eol=lf`); el contenido versionado no cambió.
- **Estilo de enlace compartido**: `composes` de CSS Modules generaba un aviso de PostCSS en la
  build. `Button` (variante `link`) y `Link` aplican directamente la clase `.textLink` de
  `src/ui/styles/textLink.module.css` (research.md R9 decía `composes`).
- **Componentes nuevos por DRY (4.1)**: `FormHeading` (título y subtítulo con `h1` enfocable) y
  `FormFooter` (pregunta + enlace) los usan el login y el registro; los estilos se movieron desde
  `LoginForm.module.css`.
- **`LoginScreen` se conserva** en `features/login` como composición de `AuthLayout` + `LoginForm`
  con los textos de marca del login, simétrica a `RegisterScreen`. El layout de dos paneles quedó
  en `ui/layout/AuthLayout` (el plan decía borrar `LoginScreen`).
- **Hallazgos del análisis resueltos al implementar**: I1 (`main.tsx` y `App.tsx` se actualizaron
  en la misma tarea que cada cambio de firma; la build nunca quedó rota), I2 (el `h1` vive en
  `RegisterForm` desde el inicio, vía `FormHeading`), I3 (data-model de 001 actualizado con las
  reglas de `displayName`), G1 (prueba de los dos controles de visibilidad) y G2 (prueba de que el
  aviso no reaparece). G4: el orden de tabulación del registro se verifica con una prueba.
- **Foco al navegar**: `useFocusOnNavigation` usa un contador de navegaciones a nivel de módulo; la
  prueba de "carga inicial" usa `vi.resetModules()` para partir de cero.
- **T056**: no se agregó una prueba aparte; `AuthLayout.test.tsx` (T018) ya verifica
  `data-mobile-brand`, que es lo que el CSS usa para ocultar el panel en móvil.
- **Resultado**: `npm run verify` en verde; 242 pruebas; cobertura 98,6 % de sentencias, 96,2 %
  de ramas, 100 % de funciones y líneas.
- **Pendiente manual**: T059 (revisión visual a 320/768/1280/1440 px contra el frame) y T068
  (17 escenarios de quickstart y teclado en un navegador real).
- **Aprobaciones pendientes para el PR**: degradado del registro y tokens accesibles (diseño, 8.6),
  cambios en módulos de 001 (revisor, 9.3) y excepción temporal de 5.5/8.7 (responsable técnico,
  9.1).
