---

description: "Task list for 002-registro-usuarios"
---

# Tasks: Pantalla de Registro de Usuarios de KynWallet

**Input**: Design documents from `/specs/002-registro-usuarios/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/registration-gateway.md,
contracts/ui-register.md, quickstart.md

**Tests**: OBLIGATORIAS. La Constitución (Principio I, TDD) exige escribir las pruebas antes del
código y verlas fallar. Cada bloque de implementación va precedido por sus pruebas.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US6)
- Rutas relativas a la raíz del repositorio. Las pruebas viven junto al código (`*.test.ts(x)`).
- Trazabilidad (Constitución 9.2): cada `it(...)` DEBE empezar con el ID del escenario, requisito
  o contrato que verifica, p. ej. `it('US4-1: …')`, `it('R6: …')`, `it('FR-007: …')`.
- Las pruebas que tocan rutas DEBEN restablecer `window.history` a `/login` en `beforeEach`.

---

## Phase 1: Setup

**Purpose**: Línea de base y trazabilidad con 001. No hay dependencias nuevas que instalar (plan,
Technical Context).

- [X] T001 Ejecutar `npm run verify` en `feature/registro-guillermo-jordan` antes de cualquier cambio y confirmar que todo pasa; si algo falla, resolverlo o registrarlo antes de seguir (línea de base para SC-003)
- [X] T002 [P] Anotar la trazabilidad con 001 (research.md R11): en `specs/001-login-billetera/spec.md`, junto a FR-016 y US5-1, una nota de que "Regístrate" navega a `/registro` según 002 FR-016; en `specs/001-login-billetera/contracts/ui-login.md`, cambiar la fila "Registro" a `link` "Regístrate" (`href=/registro`); en el Constitution Check de `specs/001-login-billetera/plan.md`, agregar las filas 5.5 y 8.7 con referencia a la excepción temporal registrada en `specs/002-registro-usuarios/plan.md` (Complexity Tracking)

**Checkpoint**: línea de base en verde y documentación de 001 alineada

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: tokens, reglas de dominio, almacén de cuentas, routing, layout y componentes que todas
las historias usan. Al terminar, el login funciona exactamente igual que antes.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tokens y estilos

- [X] T003 [P] Agregar a `src/ui/styles/tokens.css` los tokens de research.md R7: tipografía (`--font-size-display: 44px`, `--line-height-display: 1.08`, `--font-size-logo: 26px`, `--font-size-title: 30px`, `--font-size-lead: 17px`, `--line-height-lead: 1.5`, `--font-size-body: 16px`, `--font-size-input: 15px`, `--font-size-label: 14px`, `--font-size-caption: 13px`, `--font-weight-regular: 400`, `--font-weight-medium: 500`, `--font-weight-semibold: 600`, `--font-weight-bold: 700`), espaciado (`--space-1: 4px` … `--space-6: 24px`), medidas (`--form-width: 400px`, `--brand-panel-width: 620px`) y `--brand-gradient-register: linear-gradient(70.73deg, #ff8a65 31.70%, #ef5226 83.46%)` con el comentario "pendiente de confirmación de diseño"
- [X] T004 Reemplazar en el CSS existente los literales idénticos a un token nuevo (`LoginForm.module.css`, `WelcomeView.module.css`, `LoginScreen.module.css`, `BrandPanel.module.css` y los `*.module.css` de `TextField`, `Button`, `Checkbox`, `Alert` y `Divider`), conservando el gap de 22px del login. Refactor sin cambio visual: las pruebas existentes deben seguir pasando (depende de T003)
- [X] T005 [P] Crear `src/ui/styles/textLink.module.css` con la clase `.textLink` (los estilos actuales de `.link` en `src/ui/components/Button/Button.module.css`) y hacer que `.link` de `Button` la use con `composes`; las pruebas de `Button` deben seguir pasando

### Dominio

- [X] T006 [P] Renombrar `DemoAccount` → `Account` en `src/domain/auth.ts` y en todas sus referencias (`src/infrastructure/*.ts`, `src/test/fixtures.ts`); `npm run typecheck` y las pruebas existentes en verde (data-model.md)
- [X] T007 [P] Crear `src/domain/registration.ts` con los tipos `RegistrationForm`, `NewAccount` y `RegistrationResult` (`success` | `email-taken` | `unavailable`) de contracts/registration-gateway.md, y agregar a `src/domain/messages.ts`: `FULL_NAME_REQUIRED`, `FULL_NAME_TOO_LONG`, `FULL_NAME_INVALID`, `PASSWORD_CONFIRMATION_REQUIRED`, `PASSWORDS_DO_NOT_MATCH`, `TERMS_REQUIRED`, `EMAIL_TAKEN: 'Ya existe una cuenta con este correo'`, `REGISTRATION_UNAVAILABLE: 'Servicio de registro no disponible. Intenta más tarde.'`, `REGISTRATION_SUCCESS: 'Cuenta creada con éxito. Ya puedes iniciar sesión.'` y `COMING_SOON: 'Próximamente'` (textos de data-model.md)
- [X] T008 [P] Escribir las pruebas (que deben fallar) en `src/domain/validation.test.ts` según data-model.md `RegistrationForm`: `validateFullName` (vacío y solo espacios → requerido; "María José O'Neill-Núñez" y "J. R. Smith" válidos; "R2-D2" y "Ana@" → inválido; 80 caracteres válido; 81 → demasiado largo; espacios periféricos ignorados); `validatePasswordConfirmation` (vacía → requerida; distinta → no coinciden; espacios comparados sin recortar); términos `false` → `TERMS_REQUIRED`; `validateRegistration` reutiliza los mensajes de correo y contraseña de 001 y devuelve `{}` con datos válidos; `FULL_NAME_MAX_LENGTH === 80`
- [X] T009 Implementar en `src/domain/validation.ts` hasta pasar T008: exportar `validateEmail` y `validatePassword` (hoy privadas), agregar `FULL_NAME_MAX_LENGTH`, `isValidFullName`, `validateFullName` (`/^[\p{L}\p{M} '.-]+$/u`), `validatePasswordConfirmation` y `validateRegistration` (research.md R5)
- [X] T010 [P] Ampliar `src/infrastructure/loadDemoAccounts.test.ts` (debe fallar): un `displayName` que incumple las reglas de nombre completo ("R2-D2") invalida la configuración (`null`); 80 caracteres es válido y 81 no
- [X] T011 Actualizar `src/infrastructure/loadDemoAccounts.ts` hasta pasar T010: reemplazar `DISPLAY_NAME_MAX_LENGTH` por `isValidFullName` del dominio (Constitución 4.1)

### Aplicación e infraestructura

- [X] T012 [P] Crear el puerto `src/application/ports/RegistrationGateway.ts` y exportar el tipo `Register` desde `src/application/register.ts` (sin implementación de `createRegister` todavía), según contracts/registration-gateway.md
- [X] T013 [P] Escribir las pruebas (que deben fallar) en `src/infrastructure/InMemoryAccounts.test.ts` y `src/infrastructure/simulateLatency.test.ts`: con `null`, `isAvailable()` es `false`; `find` compara correos normalizados; tras `add`, `find` devuelve la cuenta; `simulateLatency()` resuelve a los 1000 ms por defecto y respeta el valor inyectado (`vi.useFakeTimers()`)
- [X] T014 Cambiar el helper de `src/infrastructure/InMemoryAuthGateway.test.ts` para construir el gateway con `new InMemoryAccounts([...])` (debe fallar); C1–C6 y FR-008 no cambian; C4 usa `new InMemoryAccounts(null)` y C5 un almacén cuyo `find` lanza una excepción
- [X] T015 Implementar `src/infrastructure/InMemoryAccounts.ts` y `src/infrastructure/simulateLatency.ts`, y cambiar el constructor de `src/infrastructure/InMemoryAuthGateway.ts` a `(accounts: InMemoryAccounts, options?: { delayMs?: number })` hasta pasar T013 y T014 (research.md R4)

### Routing

- [X] T016 [P] Escribir las pruebas (que deben fallar) en `src/ui/routing/router.test.tsx` (research.md R2, R10): `PATHS.login === '/login'`, `PATHS.register === '/registro'`; `/` y una ruta desconocida se reemplazan por `/login` sin agregar entradas al historial; `navigate` hace `pushState` y re-renderiza los componentes que usan `useRoute()`; `popstate` actualiza la ruta; `Link` renderiza `<a href>`, un clic navega sin recargar y un clic con Ctrl/Meta no se intercepta; `useFocusOnNavigation(ref)` enfoca el elemento solo después de una navegación interna, no en la carga inicial
- [X] T017 Implementar `src/ui/routing/paths.ts`, `src/ui/routing/router.ts` (`navigate`, `useRoute` con `useSyncExternalStore`, `useFocusOnNavigation`) y `src/ui/routing/Link.tsx` + `Link.module.css` (usa `.textLink` con `composes`) hasta pasar T016

### Layout y componentes

- [X] T018 [P] Escribir las pruebas (que deben fallar) en `src/ui/layout/BrandPanel/BrandPanel.test.tsx` y `src/ui/layout/AuthLayout/AuthLayout.test.tsx`: `BrandPanel` muestra el titular (una línea por elemento de `title`) y el `subtitle` recibidos por props, con la tarjeta `aria-hidden="true"`; `variant="register"` aplica el degradado del registro; `AuthLayout` renderiza `<main>` con `children` y refleja `mobileBrand` (`'logo'` | `'hidden'`) en un atributo `data-mobile-brand`
- [X] T019 Implementar los props de `src/ui/layout/BrandPanel/BrandPanel.tsx` (`title: string[]`, `subtitle`, `variant: 'login' | 'register'`) y mover `src/ui/features/login/LoginScreen.tsx` + `.module.css` a `src/ui/layout/AuthLayout/` con los props `brand` y `mobileBrand`, hasta pasar T018. El login usa `AuthLayout` con sus textos actuales y `mobileBrand="logo"`; borrar `LoginScreen.*`. Las pruebas de 001 siguen en verde
- [X] T020 [P] Ampliar `src/ui/components/Checkbox/Checkbox.test.tsx` (debe fallar): `label` acepta `ReactNode`; con `error`, el input tiene `aria-invalid="true"` y `aria-describedby` apunta al texto del error; acepta `ref` (focalizable); sin violaciones de `axe`; las pruebas actuales siguen pasando
- [X] T021 Implementar en `src/ui/components/Checkbox/Checkbox.tsx` y `Checkbox.module.css` hasta pasar T020: borde `var(--danger-600)` con error y texto de error 13px Medium como en `TextField`

### Pantalla de registro (base) y App

- [X] T022 [P] Crear `src/test/registerStub.ts` (caso de uso falso con `defer`/`release`, igual que `authStub.ts`) y agregar a `src/test/fixtures.ts` un `TEST_REGISTRATION` ficticio (nombre, correo `@example.test`, contraseña y confirmación)
- [X] T023 [P] Escribir las pruebas (que deben fallar) en `src/ui/features/register/RegisterScreen.test.tsx`: `heading` nivel 1 "Crea tu cuenta", subtítulo "Completa tus datos para comenzar", titular "Comienza tu camino financiero." y texto de apoyo del frame; sin violaciones de `axe`
- [X] T024 Implementar `src/ui/features/register/RegisterScreen.tsx` hasta pasar T023: `AuthLayout` con los textos de marca del registro, `variant="register"` y `mobileBrand="hidden"`; contenido provisional con el encabezado (el formulario llega en US1)
- [X] T025 Ampliar `src/App.test.tsx` (debe fallar): `App` recibe `authenticate` y `register`; en `/login` muestra "Bienvenido de nuevo" y en `/registro` "Crea tu cuenta"; las pruebas de accesibilidad existentes siguen pasando
- [X] T026 Implementar en `src/App.tsx` la selección de pantalla con `useRoute()` y los props `authenticate` y `register`, hasta pasar T025

**Checkpoint**: `npm test` en verde con todas las pruebas de 001; `npm run dev` muestra el login sin cambios visibles en `/login` y el panel de marca del registro con su título en `/registro`

---

## Phase 3: User Story 1 - Crear una cuenta con datos válidos (Priority: P1) 🎯 MVP

**Goal**: con datos válidos, el usuario crea la cuenta, vuelve a `/login` con el aviso de éxito y puede iniciar sesión con ella en la misma visita

**Independent Test**: completar el formulario con datos válidos, ver la carga y llegar a `/login` con "Cuenta creada con éxito. Ya puedes iniciar sesión."; iniciar sesión con la cuenta nueva (quickstart escenarios 1–4)

### Tests for User Story 1 ⚠️

> Escribir primero; confirmar que FALLAN antes de implementar

- [X] T027 [P] [US1] Pruebas del caso de uso en `src/application/register.test.ts`: U1 llama al gateway con el correo normalizado, el nombre sin espacios periféricos y la contraseña sin cambios; U2 si el gateway lanza o rechaza, devuelve `unavailable` sin rechazar la promesa
- [X] T028 [P] [US1] Pruebas de contrato en `src/infrastructure/InMemoryRegistrationGateway.test.ts`: R1 correo nuevo → `success`, y un `InMemoryAuthGateway` sobre el mismo almacén autentica la cuenta con `displayName` igual al nombre; R3 almacén no disponible → `unavailable`; R4 excepción interna → `unavailable`; R5 el resultado no contiene la contraseña; R6 dos llamadas concurrentes con el mismo correo → solo una `success`; FR-011 espera 1000 ms por defecto
- [X] T029 [P] [US1] Pruebas del reducer en `src/ui/features/register/registerReducer.test.ts` (data-model.md `RegisterFormState`): estado inicial `editing` con valores vacíos y `termsAccepted: false`; `change` y `toggleTerms` actualizan valores; `submit` válido → `submitting`; un segundo `submit` en `submitting` se ignora
- [X] T030 [P] [US1] Ampliar `src/ui/features/login/LoginForm.test.tsx`: con el prop `notice`, muestra un `status` con ese texto bajo el título; la primera edición de un campo llama a `onNoticeDismiss`
- [X] T031 [US1] Pruebas de integración en `src/ui/features/register/RegisterForm.test.tsx` con `registerStub`: US1-1 datos válidos y términos → llama a `register` y luego a `onRegistered`; US1-2 durante la espera, "Creando cuenta…" con `aria-busy`, deshabilitado, y un segundo clic o Enter no llama de nuevo; US1-6 Enter en un campo de texto envía; caso límite: doble clic → una sola llamada
- [X] T032 [US1] Pruebas de punta a punta en `src/App.test.tsx` con `InMemoryAccounts` y ambos gateways reales (`delayMs: 0`): US1-1 registro → `window.location.pathname === '/login'` y aviso visible; US1-3 iniciar sesión con la cuenta nueva → "¡Bienvenido, {nombre}!"; US1-4 el aviso desaparece al escribir en el login; US1-5 un correo con mayúsculas y espacios queda guardado normalizado (login con el correo en minúsculas funciona); FR-012 desmontar y volver a montar `App` con un almacén nuevo → sin aviso y la cuenta ya no existe; FR-015/FR-019 tras el flujo, `location.search` y `location.hash` vacíos y `localStorage`/`sessionStorage` sin entradas

### Implementation for User Story 1

- [X] T033 [P] [US1] Implementar `createRegister` en `src/application/register.ts` hasta pasar T027
- [X] T034 [P] [US1] Implementar `src/infrastructure/InMemoryRegistrationGateway.ts` hasta pasar T028: espera con `simulateLatency`, luego verifica y agrega en el mismo paso síncrono (R6); captura excepciones; sin `console` ni registro de la contraseña
- [X] T035 [US1] Implementar `src/ui/features/register/registerReducer.ts` hasta pasar T029, con el estado y las acciones de data-model.md; `submit` usa `validateRegistration` y `visibleErrors`
- [X] T036 [US1] Implementar el hook `src/ui/features/register/useRegisterForm.ts` (como `useLoginForm`): recibe `register` y `onRegistered`; evita el doble envío con una ref; ignora resultados si el componente se desmonta; en `success` llama a `onRegistered`
- [X] T037 [US1] Implementar `src/ui/features/register/RegisterForm.tsx` y `RegisterForm.module.css` hasta pasar T031, según contracts/ui-register.md: `<form noValidate>`; `TextField` "Nombre completo" (`autoComplete="name"`, placeholder "Ej: Diego Martínez"), `TextField` "Correo electrónico" (`type="email"`, `autoComplete="email"`), `PasswordField` "Contraseña" y "Confirmar contraseña" (`autoComplete="new-password"`, placeholder "••••••••"), `Checkbox` con la etiqueta "Acepto los términos y condiciones", `Button` submit "Crear cuenta" con `loadingLabel="Creando cuenta…"`. Espaciados con tokens (research.md R7: `--space-4` entre campos, `--space-2` etiqueta-campo y título-subtítulo, `--space-5` subtítulo-primer campo). `RegisterScreen` pasa a renderizar `RegisterForm`
- [X] T038 [US1] Agregar a `src/ui/features/login/LoginForm.tsx` los props opcionales `notice` y `onNoticeDismiss` hasta pasar T030: `Alert tone="info"` bajo el encabezado; llama a `onNoticeDismiss` en el primer `change`
- [X] T039 [US1] Conectar `src/App.tsx` y `src/main.tsx` hasta pasar T032: `App` guarda `registrationNotice` en su estado; `onRegistered` asigna `MESSAGES.REGISTRATION_SUCCESS` y llama a `navigate(PATHS.login)`; descarta el aviso al salir de `/login`. `main.tsx` crea un único `InMemoryAccounts` a partir de `loadDemoAccounts`, ambos gateways y ambos casos de uso, y los inyecta en `App` (Constitución 2.5)

**Checkpoint**: US1 funciona de punta a punta con `npm run dev` (quickstart 1–4) y sus pruebas pasan

---

## Phase 4: User Story 2 - Validar los datos en línea antes de enviar (Priority: P1)

**Goal**: cada control muestra su error al salir de él o al enviar, la coincidencia de contraseñas se reevalúa sola y el foco va al primer error

**Independent Test**: enviar vacío y luego con datos inválidos campo por campo (quickstart escenarios 5–7 y 10)

### Tests for User Story 2 ⚠️

- [X] T040 [P] [US2] Ampliar `src/ui/features/register/registerReducer.test.ts`: `blur` marca el control como tocado y calcula su error; un control no tocado no muestra errores aunque otro cambie (US2-6); `submit` con errores marca todo como tocado y queda en `editing` sin pasar a `submitting` (FR-010); FR-007 con la confirmación tocada, cambiar la contraseña muestra u oculta "Las contraseñas no coinciden"; `change` en un control con error lo oculta al quedar válido (US2-7)
- [X] T041 [US2] Ampliar `src/ui/features/register/RegisterForm.test.tsx`: US2-1 envío vacío → los cinco mensajes, `register` no invocado y foco en "Nombre completo"; US2-2 "usuario@" + blur → correo válido; US2-3 contraseña de 7 caracteres + blur → mensaje de longitud; US2-4 confirmación distinta + blur → no coinciden; US2-5 corregir cualquiera de los dos campos hasta que coincidan oculta el mensaje; US2-8 cada control con error tiene `aria-invalid` y su descripción incluye el mensaje; FR-010 el foco va al primer error en el orden nombre → correo → contraseña → confirmación → términos; casos límite: todo válido sin términos → error en la casilla con el foco en ella; nombre y correo solo con espacios → requeridos; texto pegado se valida igual que el escrito; "R2-D2" → "Ingresa un nombre válido"; nombre de 81 caracteres → "El nombre no puede superar 80 caracteres"

### Implementation for User Story 2

- [X] T042 [US2] Ampliar `src/ui/features/register/registerReducer.ts` hasta pasar T040 (acción `blur`; recálculo con todos los valores en cada `change`)
- [X] T043 [US2] Ampliar `src/ui/features/register/RegisterForm.tsx` hasta pasar T041: `onBlur` en cada control, `error` en cada campo y en la casilla, y `ref` por control para mover el foco al primer error devuelto por `submit`

**Checkpoint**: US1 y US2 funcionan y se prueban de forma independiente

---

## Phase 5: User Story 3 - Navegar entre registro e inicio de sesión (Priority: P2)

**Goal**: enlaces reales entre `/login` y `/registro`, atrás/adelante y direcciones directas, con el foco en el título de la pantalla nueva

**Independent Test**: "Inicia sesión" desde el registro, "Regístrate" desde el login, atrás/adelante, y abrir `/` y una dirección inexistente (quickstart escenarios 12–13)

### Tests for User Story 3 ⚠️

- [X] T044 [P] [US3] Cambiar en `src/ui/features/login/LoginForm.test.tsx` el caso de "Regístrate" de US5-1 (001): ahora es un `link` "Regístrate" con `href="/registro"` y ya no muestra "Función no disponible en esta demostración". Los casos de "¿Olvidaste tu contraseña?", Google y Apple no cambian
- [X] T045 [P] [US3] Ampliar `src/ui/features/register/RegisterForm.test.tsx`: existe el `link` "Inicia sesión" con `href="/login"`, precedido por el texto "¿Ya tienes cuenta?"
- [X] T046 [US3] Ampliar `src/App.test.tsx`: US3-1 desde `/registro` con datos escritos, "Inicia sesión" → `/login` sin aviso, y al volver con "Regístrate" el formulario está vacío; US3-2 "Regístrate" → `/registro` con el formulario vacío; US3-3 `history.back()` y `history.forward()` muestran la pantalla de cada dirección; US3-4 montar con `/registro` o `/login` como dirección inicial; US3-5 `/` y `/cualquier-cosa` muestran el login en `/login`; FR-021 tras navegar, el foco está en el `h1` de la pantalla nueva, y en la carga inicial no

### Implementation for User Story 3

- [X] T047 [P] [US3] En `src/ui/features/login/LoginForm.tsx`, reemplazar el `Button` "Regístrate" por `Link` a `PATHS.register` y dar al `h1` `tabIndex={-1}` con `useFocusOnNavigation`, hasta pasar T044
- [X] T048 [P] [US3] En `src/ui/features/register/RegisterForm.tsx`, agregar el pie "¿Ya tienes cuenta?" + `Link` "Inicia sesión" y el foco del `h1` con `useFocusOnNavigation`, hasta pasar T045
- [X] T049 [US3] Ajustar `src/App.tsx` o `src/ui/routing/router.ts` si hace falta para pasar T046

**Checkpoint**: la navegación funciona en ambos sentidos y con los botones del navegador

---

## Phase 6: User Story 4 - Rechazar un correo ya registrado (Priority: P2)

**Goal**: un correo existente no crea cuenta y muestra "Ya existe una cuenta con este correo"; los errores del servicio se informan sin detalles

**Independent Test**: registrar el correo de una cuenta de demostración en mayúsculas (quickstart escenarios 8 y 16)

### Tests for User Story 4 ⚠️

- [X] T050 [P] [US4] Ampliar `src/infrastructure/InMemoryRegistrationGateway.test.ts`: R2 un correo de demostración, uno registrado en la misma visita y variantes con mayúsculas o espacios → `email-taken`, y el almacén no cambia (la contraseña original sigue funcionando en `InMemoryAuthGateway`)
- [X] T051 [P] [US4] Ampliar `src/ui/features/register/registerReducer.test.ts`: `result: email-taken` y `result: unavailable` → `registerError`, se conservan nombre y correo, se vacían contraseña y confirmación y dejan de estar tocadas; `change` de cualquier campo limpia `registerError` y vuelve a `editing`
- [X] T052 [US4] Ampliar `src/ui/features/register/RegisterForm.test.tsx`: US4-1 `alert` "Ya existe una cuenta con este correo", `onRegistered` no se llama y el foco va al correo; US4-2 nombre y correo conservados, contraseñas vacías, sin mensajes de "obligatorio" en ellas, y el `alert` desaparece al editar; FR-023 un resultado `unavailable` muestra "Servicio de registro no disponible. Intenta más tarde."

### Implementation for User Story 4

- [X] T053 [P] [US4] Ajustar `src/infrastructure/InMemoryRegistrationGateway.ts` si hace falta para pasar T050
- [X] T054 [US4] Ampliar `src/ui/features/register/registerReducer.ts` hasta pasar T051
- [X] T055 [US4] Ampliar `src/ui/features/register/RegisterForm.tsx` hasta pasar T052: `Alert tone="error"` con `EMAIL_TAKEN` o `REGISTRATION_UNAVAILABLE` debajo de la casilla y antes del botón; foco al correo tras `email-taken`

**Checkpoint**: el registro rechaza duplicados sin perder los datos válidos

---

## Phase 7: User Story 5 - Usar el registro en móvil y en escritorio (Priority: P2)

**Goal**: dos paneles en escritorio y solo el formulario en móvil, sin scroll horizontal desde 320px, fiel al frame

**Independent Test**: abrir `/registro` a 320px y a 1440px (quickstart escenarios 14–15)

### Tests for User Story 5 ⚠️

- [X] T056 [P] [US5] Ampliar `src/ui/layout/AuthLayout/AuthLayout.test.tsx`: con `mobileBrand="hidden"`, el panel de marca lleva la clase que lo oculta por debajo de 960px; con `"logo"`, no (jsdom no evalúa media queries: la verificación visual es T059)

### Implementation for User Story 5

- [X] T057 [US5] En `src/ui/layout/AuthLayout/AuthLayout.module.css` y `src/ui/layout/BrandPanel/BrandPanel.module.css`, ocultar el panel por debajo de 960px cuando `mobileBrand="hidden"`, manteniendo los puntos de corte de 001 R10 en escritorio, hasta pasar T056
- [X] T058 [US5] Completar `src/ui/features/register/RegisterForm.module.css` según research.md R7: columna de `var(--form-width)`, `--space-5` antes y después del separador y antes del pie, botones sociales en grilla de dos columnas con gap `--space-4`, pie centrado; sin anchos fijos que provoquen scroll a 320px
- [ ] T059 [US5] Verificación visual con `npm run dev` a 320px, 768px, 1280px y 1440px: sin scroll horizontal, solo formulario en móvil, dos paneles en escritorio; comparar con el frame `04 · Registro` (nodo `31:2`, archivo `AtXTxOsBbISgGtDp0rk4kf`) y registrar en `plan.md` (Implementation Notes) cualquier diferencia de textos, orden o jerarquía (SC-006)

**Checkpoint**: la pantalla es usable y fiel al diseño en todos los anchos

---

## Phase 8: User Story 6 - Opciones aún no disponibles: Google, Apple y términos (Priority: P3)

**Goal**: Google, Apple y "términos y condiciones" muestran "Próximamente" sin perder datos ni cambiar la casilla

**Independent Test**: activar cada uno y verificar el aviso (quickstart escenario 11)

### Tests for User Story 6 ⚠️

- [X] T060 [P] [US6] Ampliar `src/ui/features/register/registerReducer.test.ts`: `showNotice` asigna el aviso sin modificar valores, `touched` ni errores; `submit` limpia el aviso
- [X] T061 [US6] Ampliar `src/ui/features/register/RegisterForm.test.tsx`: US6-1 "Google" y "Apple" muestran el `status` "Próximamente" y conservan los datos escritos; US6-2 el `button` "términos y condiciones" muestra "Próximamente" y la casilla no cambia de estado; el nombre accesible de la casilla es "Acepto los términos y condiciones"; existe el separador "o regístrate con"

### Implementation for User Story 6

- [X] T062 [US6] Ampliar `src/ui/features/register/registerReducer.ts` hasta pasar T060
- [X] T063 [US6] Ampliar `src/ui/features/register/RegisterForm.tsx` hasta pasar T061: `Divider` "o regístrate con", `SocialButton` Google y Apple, y `Button variant="link"` "términos y condiciones" dentro de la etiqueta de la casilla, todos con `showNotice(MESSAGES.COMING_SOON)`; `Alert tone="info"` debajo de los botones sociales

**Checkpoint**: todas las historias funcionan de forma independiente

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: accesibilidad de pantalla completa, documentación y controles de la Constitución

- [X] T064 [P] Ampliar `src/App.test.tsx` con auditorías `axe` sin violaciones (FR-021, SC-005): registro vacío; registro con todos los errores visibles y el aviso "Próximamente"; registro con `alert` de correo en uso; login con el aviso de registro exitoso
- [X] T065 [P] Actualizar `README.md`: rutas `/login` y `/registro`, flujo de registro y la nota de hosting (devolver `index.html` para cualquier ruta) de quickstart.md
- [X] T066 [P] Revisar que ningún archivo nuevo use `console`, que la contraseña no aparezca en mensajes, URL ni almacenamiento (FR-019), y que no queden literales de color, tipografía o espaciado que tengan token (Constitución 4.1)
- [X] T067 Ejecutar `npm run verify`: lint, formato, typecheck, cobertura ≥ 80 %, build, auditoría de dependencias y licencias y escaneo de secretos en verde (Constitución 9.4)
- [ ] T068 Recorrer los 17 escenarios de quickstart.md con `npm run dev` y la navegación solo con teclado (FR-020), y registrar el resultado
- [X] T069 Actualizar `plan.md` (Implementation Notes) con las decisiones tomadas durante la implementación y dejar listas para el PR las aprobaciones pendientes: degradado del registro y tokens accesibles (diseño, 8.6), cambios en módulos de 001 (revisor, 9.3) y la excepción temporal de 5.5 y 8.7 (responsable técnico, 9.1; vence el 2027-03-31 o con el primer backend). Sin esa aprobación, el PR no se integra

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: sin dependencias
- **Foundational (Phase 2)**: depende de Setup; **bloquea todas las historias**
- **US1 (Phase 3)**: depende de Foundational. Es el MVP
- **US2 (Phase 4)**: depende de US1 (amplía `registerReducer` y `RegisterForm`)
- **US3 (Phase 5)**: depende de Foundational (routing) y de US1 (`RegisterForm`); puede hacerse en paralelo con US2 si se coordinan los cambios en `RegisterForm.tsx`
- **US4 (Phase 6)**: depende de US1
- **US5 (Phase 7)**: depende de US1; T059 conviene hacerlo con US6 terminada para comparar el frame completo
- **US6 (Phase 8)**: depende de US1
- **Polish (Phase 9)**: depende de todas las historias

### Within Each User Story

- Las pruebas se escriben y se ven FALLAR antes de implementar (Principio I)
- Dominio → caso de uso → infraestructura → reducer → hook → componente → `App`
- Cada historia se cierra con sus pruebas en verde y `npm run lint` limpio

### Parallel Opportunities

- Setup: T002 en paralelo con T001
- Foundational: T003, T005, T006, T007, T008, T010, T012, T013, T016, T018, T020, T022, T023
- US1: pruebas T027–T030 en paralelo; implementación T033 y T034 en paralelo
- US3: T044 y T045 en paralelo; T047 y T048 en paralelo
- US4: T050 y T051 en paralelo
- Polish: T064, T065, T066
- Después de US1, US2, US4 y US6 tocan los mismos archivos (`registerReducer.ts`, `RegisterForm.tsx`): conviene hacerlas en secuencia

---

## Parallel Example: Foundational

```bash
# Pruebas y tareas independientes de Foundational (archivos distintos):
Task: "T003 Tokens nuevos en src/ui/styles/tokens.css"
Task: "T008 Pruebas de validateRegistration en src/domain/validation.test.ts"
Task: "T013 Pruebas de InMemoryAccounts y simulateLatency"
Task: "T016 Pruebas del router en src/ui/routing/router.test.tsx"
Task: "T018 Pruebas de BrandPanel y AuthLayout"
Task: "T020 Pruebas de Checkbox con error y label ReactNode"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Completar Phase 1 (Setup) y Phase 2 (Foundational): el login sigue igual y `/registro` existe
2. Completar Phase 3 (US1)
3. **DETENERSE Y VALIDAR**: quickstart escenarios 1–4
4. Demostrar el MVP

### Incremental Delivery

1. Setup + Foundational → base lista, login intacto
2. US1 → registro exitoso y cuenta usable (MVP)
3. US2 → validación en línea (completa los P1)
4. US3 → navegación entre pantallas
5. US4 → correo duplicado
6. US5 → responsive y fidelidad al frame
7. US6 → avisos "Próximamente"
8. Polish → `npm run verify` en verde y PR con revisión (Constitución 9.3)

---

## Notes

- [P] = archivos distintos, sin dependencias pendientes
- La etiqueta [USn] y los IDs en los nombres de las pruebas dan la trazabilidad requisito → prueba (9.2)
- Hacer commit al cerrar cada tarea o grupo lógico, referenciando el ID de la tarea (p. ej. `T015`)
- Pruebas de 001 que cambian a propósito: T014 (constructor del gateway), T025 (props de `App`) y T044 ("Regístrate"). Cualquier otra prueba de 001 que falle es una regresión
- Decisiones pendientes que pueden cambiar tareas: (a) si diseño rechaza el degradado del registro, se elimina `--brand-gradient-register` (T003) y la variante de `BrandPanel` (T018–T019); (b) si diseño rechaza los tokens accesibles, cambian T003–T004 y hay que resolver el incumplimiento de WCAG; (c) si se cambia el mensaje de correo en uso, cambian T007, T052 y T055
