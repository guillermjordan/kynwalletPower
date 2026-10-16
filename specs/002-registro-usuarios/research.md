# Research: Pantalla de Registro de Usuarios de KynWallet

**Feature**: `002-registro-usuarios` | **Date**: 2026-10-16

Todas las incógnitas del Technical Context quedan resueltas aquí. Las decisiones de `001`
(stack, CSS Modules, pruebas, controles de cumplimiento, contraste) se mantienen; solo se
documenta lo nuevo o lo que cambia.

## R1. Stack, estructura y patrones

- **Decision**: se reutiliza tal cual el stack de 001 (React 19, TypeScript `strict`, Vite 8,
  Vitest 5 + Testing Library, `axe-core`, CSS Modules con tokens) y su organización en capas
  (`domain`, `application`, `infrastructure`, `ui`), con la regla de dependencias verificada por
  ESLint.
- **Rationale**: pedido explícito del usuario; Constitución 8.5 (reutilizar antes de crear).
- **Alternatives considered**: ninguna; cambiar de stack no responde a ningún requisito.

## R2. Routing (`/login`, `/registro`)

El login actual no tiene router: `App` renderiza la pantalla de login directamente. La feature
exige direcciones reales, enlaces directos y botones atrás/adelante (FR-002).

- **Decision**: módulo propio `src/ui/routing/` sobre la History API del navegador
  (`pushState`, `replaceState`, evento `popstate`) expuesto con `useSyncExternalStore`. Incluye
  `PATHS`, `navigate(path)`, el hook `useRoute()` y el componente `Link`. Las direcciones
  desconocidas y la raíz se reemplazan por `/login` con `replaceState`.
- **Rationale**: son dos rutas sin parámetros, sin rutas anidadas ni carga de datos; la solución
  propia ocupa unas 60 líneas probadas y evita una dependencia (Constitución 4.2, 7.4).
- **Alternatives considered**:
  - `react-router` 7 (MIT, mantenido): resolvería lo mismo, pero añade una dependencia de runtime
    cuyo valor (rutas anidadas, loaders, parámetros) no responde a ningún requisito (YAGNI).
    **Se reconsidera** si una feature futura necesita rutas con parámetros o anidadas.
  - Estado de vista en `App` sin URL: incumple FR-002 (dirección `/registro`, atrás/adelante).
- **Nota de despliegue**: `vite dev` y `vite preview` ya devuelven `index.html` para cualquier
  ruta (modo SPA). Un hosting de producción necesita la regla de reescritura equivalente; se
  documenta en quickstart.

## R3. Mensaje de éxito al volver al login (FR-014, FR-015)

- **Decision**: el aviso de registro exitoso vive en el estado de `App` (memoria). Al recibir
  `onRegistered`, `App` guarda el aviso y navega a `/login`; `LoginForm` lo recibe por prop y
  pide descartarlo cuando el usuario edita un campo. `App` también lo descarta al salir de
  `/login`.
- **Rationale**: no viaja en la URL (FR-015) y desaparece al recargar (US1-4) sin código extra.
- **Alternatives considered**:
  - Parámetro en la URL (`/login?registered=1`): incumple FR-015 y reaparece al recargar.
  - `history.state`: sobrevive a la recarga; habría que limpiarlo con `replaceState` al leerlo,
    lo que es frágil con el doble montaje de `StrictMode`.
  - `sessionStorage`: sobrevive a la recarga y FR-012 excluye el almacenamiento del navegador.

## R4. Simulación del registro y cuentas compartidas con el login

Requisitos: el registro se simula como la autenticación (pedido del usuario); una cuenta creada
debe poder iniciar sesión en la misma visita (FR-012); un correo repetido se rechaza (FR-013).

- **Decision**:
  - Nuevo puerto `RegistrationGateway` en `application/ports/` (separado de `AuthGateway`,
    Constitución 2.4) y caso de uso `createRegister`, análogo a `createAuthenticate`: normaliza
    correo y nombre y convierte excepciones en `unavailable`.
  - Nuevo almacén `InMemoryAccounts` en `infrastructure/`: contiene las cuentas en memoria
    (`find(email)`, `add(account)`) y se crea a partir de `loadDemoAccounts`.
  - `InMemoryAuthGateway` pasa a recibir el almacén en lugar del arreglo; nuevo
    `InMemoryRegistrationGateway` con el mismo almacén. Ambos comparten la espera simulada
    (`simulateLatency`, 1000 ms por defecto, inyectable).
  - La unicidad del correo la decide el adaptador, igual que la comparación de credenciales en
    el login: el adaptador simula al servidor, que es quien la decidiría en un sistema real.
  - Si la configuración de cuentas falta o es inválida, el almacén queda "no disponible" y ambos
    gateways responden `unavailable` (comportamiento coherente con 001).
- **Rationale**: SRP (un almacén, dos adaptadores con una responsabilidad cada uno), ISP (la UI
  de registro no conoce `authenticate`) y DIP (ambos casos de uso dependen de puertos). El cambio
  en `InMemoryAuthGateway` es solo su constructor; su contrato (`AuthGateway`) no cambia.
- **Alternatives considered**:
  - Una sola clase que implemente los dos puertos: mezcla dos razones de cambio.
  - Pasar el mismo arreglo mutable a ambos gateways sin almacén: acoplamiento implícito y
    contrario al tipo `readonly` actual.
  - Puerto tipo repositorio (`findByEmail`, `add`) con la regla de unicidad en el caso de uso:
    más correcto para un backend propio, pero diverge del patrón del login, que delega la regla
    en el gateway. Se descarta por consistencia (pedido del usuario).

## R5. Validación del registro

- **Decision**: reglas puras en `domain/validation.ts`, reutilizando las del login:
  - Se exportan `validateEmail` y `validatePassword`, hoy privadas, y se reutilizan sin cambios.
  - Nuevas: `validateFullName` (trim, obligatorio, ≤ 80, solo `[\p{L}\p{M} '.-]`),
    `validatePasswordConfirmation` (obligatoria, igualdad exacta) y `validateTerms`.
  - `validateRegistration(form) → RegistrationErrors` las combina; `{}` significa válido.
  - `FULL_NAME_MAX_LENGTH = 80` pasa al dominio y `loadDemoAccounts` lo usa en lugar de su
    constante local `DISPLAY_NAME_MAX_LENGTH` (Constitución 4.1).
  - Mensajes nuevos en `MESSAGES`; la contraseña vacía reutiliza `PASSWORD_REQUIRED` ("Ingresa tu
    contraseña"), por lo que la spec se alineó a ese texto.
- **Rationale**: una sola política de correo y contraseña para login y registro; reglas
  testeables sin UI.
- **Alternatives considered**: Zod u otra librería de esquemas (dependencia innecesaria para
  cinco campos, como en 001 R6).

## R6. Estado del formulario

- **Decision**: `registerReducer` + `useRegisterForm`, con la misma forma que el login: estados
  `editing → submitting → registerError | (éxito: callback)`, `values`, `touched`,
  `fieldErrors`, `registerError` y `notice`. El cálculo "errores visibles solo de campos tocados"
  se extrae a `ui/forms/visibleErrors.ts` y lo usan los dos reducers.
- **Rationale**: misma solución que el login (pedido del usuario); el helper evita duplicar la
  lógica de `touched` (4.1). La coincidencia de contraseñas se reevalúa sola porque los errores
  se recalculan con todos los valores en cada cambio (FR-007).
- **Alternatives considered**: un reducer genérico de formularios para ambos: abstracción
  especulativa con solo dos formularios (4.2).

## R7. Tokens de diseño del frame `04 · Registro`

El frame no tiene variables de Figma (`get_variable_defs` devuelve `{}`); los valores salen de
`get_design_context` sobre el nodo `31:2` del archivo `AtXTxOsBbISgGtDp0rk4kf`.

**Colores**: todos coinciden con tokens existentes; no se crean colores nuevos salvo el
degradado.

| Uso en el frame | Valor en Figma | Token |
|---|---|---|
| Título, texto de botones sociales | `#16182c` | `--neutral-900` |
| Etiquetas, "Acepto los" | `#3d3f5c` | `--neutral-700` |
| Subtítulo, separador, "¿Ya tienes cuenta?" | `#8a8ba8` | `--neutral-500` (`#8a8ca8`; diferencia de redondeo) → se usa `--neutral-600` por contraste (001 R3) |
| Texto de ejemplo | `#a9abc2` | `--neutral-400` → `--neutral-600` por contraste |
| Bordes de campos, casilla y sociales; líneas del separador | `#d7d9e6` | `--neutral-300` (líneas) y `--neutral-border` (controles, por contraste 1.4.11) |
| Botón "Crear cuenta" | `#ff6b3d` | `--brand-500` → `--brand-700` por contraste |
| Enlaces "términos y condiciones", "Inicia sesión" | `#ef5226` | `--brand-600` → `--brand-700` por contraste |
| Panel de marca | `linear-gradient(70.73deg, #ff8a65 31.70%, #ef5226 83.46%)` | **nuevo** `--brand-gradient-register` |

**Naranja principal**: `#ff6b3d` (`--brand-500`) es el color de marca del botón "Crear cuenta";
`#ef5226` (`--brand-600`) el de los enlaces y el final del degradado. Ambos se conservan como
tokens; en texto y fondos de texto se pintan con `--brand-700` (`#d04721`, 4.56:1) por contraste
(001 R3), y `--brand-800` es el hover del botón.

**Radios y alturas** (medidos en el frame; todos coinciden con tokens existentes):

| Elemento | Frame | Token |
|---|---|---|
| Campos, botón principal, botones sociales | radio 12px | `--radius-control` |
| Casilla de términos, chip de la tarjeta | radio 6px | `--radius-checkbox` |
| Tarjeta del panel de marca | radio 22px | `--radius-card` |
| Campos y botón principal | alto 52px | `--control-height` |
| Botones sociales | alto 48px | `--social-height` |
| Casilla | 20 × 20px | literal en `Checkbox.module.css` (sin cambios) |
| Bordes de campos y casilla | 1.5px | literal compartido por los componentes (sin cambios) |

**Tipografía** (Inter): hoy los tamaños están escritos en cada CSS. Se crean tokens a partir de
los valores que comparten ambos frames:

| Token | Valor | Uso |
|---|---|---|
| `--font-size-display` / `--line-height-display` | 44px / 1.08 | Titular del panel de marca (Bold) |
| `--font-size-logo` | 26px | "KynWallet" (Bold) |
| `--font-size-title` | 30px | "Crea tu cuenta" (Bold) |
| `--font-size-lead` / `--line-height-lead` | 17px / 1.5 | Texto de apoyo del panel |
| `--font-size-body` | 16px | Subtítulo, texto del botón principal |
| `--font-size-input` | 15px | Texto de campos y botones sociales |
| `--font-size-label` | 14px | Etiquetas, casilla, enlaces, pie |
| `--font-size-caption` | 13px | Separador, mensajes de error |
| `--font-weight-regular/medium/semibold/bold` | 400/500/600/700 | |

**Espaciados** medidos en el frame (px) y token asignado:

| Entre | Frame | Token |
|---|---|---|
| Título → subtítulo | 6 | `--space-2` (8; igual que el login) |
| Subtítulo → primer campo | 21 | `--space-5` (20) |
| Etiqueta → campo | 7 | `--space-2` (8) |
| Campo → campo, casilla → botón | 16 | `--space-4` (16) |
| Último campo → casilla | 18 | `--space-4` (16) |
| Botón → separador → sociales → pie | 20 / 14 / 20 | `--space-5` (20) |
| Botón Google ↔ Apple | 16 | `--space-4` (16) |

Escala: `--space-1: 4px`, `--space-2: 8px`, `--space-3: 12px`, `--space-4: 16px`,
`--space-5: 20px`, `--space-6: 24px`. Medidas de layout: `--form-width: 400px`,
`--brand-panel-width: 620px`.

- **Decision**: añadir esos tokens a `tokens.css` y usarlos en todo el CSS nuevo. En el CSS
  existente del login se reemplazan los literales idénticos por el token (refactor sin cambio
  visual, cubierto por las pruebas existentes). El gap de 22px del login se mantiene como valor
  propio de esa pantalla.
- **Rationale**: pedido del usuario y Constitución 4.1 (una fuente por valor).
- **Pending**: confirmar con diseño si el degradado distinto del registro es intencional; si no,
  se elimina `--brand-gradient-register` y se usa `--brand-gradient`.

## R8. Layout y responsive

- **Decision**: la pantalla de login (`LoginScreen` + `BrandPanel`) se generaliza como
  `ui/layout/AuthLayout`, que recibe el contenido del panel de marca (titular, texto de apoyo,
  degradado) y su comportamiento en móvil:
  - Login: igual que hoy (`mobileBrand="logo"`, cabecera con logo por debajo de 960px).
  - Registro: `mobileBrand="hidden"`; por debajo de 960px solo se muestra el formulario
    (FR-022, "mobile solo formulario").
  - Escritorio: los mismos puntos de corte que 001 R10 (dos columnas desde 960px, panel de 620px
    desde 1280px).
- El formulario se centra vertical y horizontalmente como en el login; el frame lo ubica 34px más
  arriba que el centro, diferencia que se acepta para mantener un único layout.
- **Rationale**: un solo layout para ambas pantallas (8.5, 4.1).
- **Alternatives considered**: copiar `LoginScreen` como `RegisterScreen` (duplicación).

## R9. Componentes reutilizados y cambios

| Componente | Uso en el registro | Cambio |
|---|---|---|
| `TextField` | Nombre completo, correo | Ninguno |
| `PasswordField` | Contraseña y confirmación, cada una con su control de visibilidad | Ninguno |
| `Checkbox` | Términos | `label` acepta `ReactNode` (para incluir el enlace) y se suman `error` y `ref` opcionales, con `aria-invalid` y `aria-describedby` como `TextField` |
| `Button` | "Crear cuenta" (carga), "términos y condiciones" (variante `link`) | Ninguno |
| `SocialButton`, `Divider`, `Alert` | Google/Apple, "o regístrate con", avisos | Ninguno; el aviso de éxito usa el tono `info` (`role=status`) |
| `BrandPanel` | Panel de marca | Recibe titular, texto de apoyo y variante de degradado por props |
| `Link` (nuevo, `ui/routing`) | "Inicia sesión", "Regístrate" | Enlace `<a href>` real que navega sin recargar; comparte estilos con la variante `link` de `Button` mediante `composes` de CSS Modules |

- **Enlace dentro de la etiqueta de la casilla**: el botón "términos y condiciones" va dentro de
  la `<label>`, así el nombre accesible de la casilla es "Acepto los términos y condiciones". Por
  la especificación HTML, activar un elemento interactivo dentro de una `label` no cambia la
  casilla (US6-2); una prueba lo verifica.
- **Recursos gráficos**: se reutilizan `logo-mark.svg`, `eye.svg` y `social-placeholder.svg`. En
  el frame el logo está dibujado con dos elipses sueltas, pero es el mismo logo del login; no se
  descargan recursos nuevos.

## R10. Foco al cambiar de pantalla (FR-021)

- **Decision**: el `h1` de cada pantalla tiene `tabIndex={-1}` y recibe el foco al montarse solo
  si se llegó por navegación interna (no en la carga inicial). `ui/routing` expone
  `useFocusOnNavigation(ref)`.
- **Rationale**: los lectores de pantalla anuncian el cambio de pantalla, igual que la vista de
  bienvenida del login (FR-009 de 001).

## R11. Impacto en la feature 001

- El enlace "Regístrate" deja de mostrar "Función no disponible en esta demostración" y navega
  a `/registro`. Cambian el escenario 001 US5-1 (solo para "Regístrate") y su prueba, y la
  tabla de `contracts/ui-login.md` (pasa de `button` a `link`).
- El login muestra el aviso de registro exitoso (nueva prop opcional de `LoginForm`).
- La spec 001 se anota con una referencia a 002 FR-016 para mantener la trazabilidad (9.2).
