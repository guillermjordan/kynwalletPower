# KynWallet · Inicio de sesión y registro (demo)

Demostración funcional, solo del lado del cliente, de las pantallas de inicio de sesión y de
registro de la billetera virtual KynWallet. Reproduce los diseños de Figma
([01 · Login](https://www.figma.com/design/f7uDsv8sh6ZOtK2OitTqtg/Billetera-Virtual---Prototipos?node-id=2-2)
y `04 · Registro`, nodo `31:2`), valida los campos y simula la autenticación y el registro con
cuentas en memoria, sin backend ni base de datos.

| Ruta        | Pantalla                                                         |
| ----------- | ---------------------------------------------------------------- |
| `/login`    | Inicio de sesión. La raíz y cualquier otra dirección llevan aquí |
| `/registro` | Registro de usuarios                                             |

Especificaciones, planes y tareas: [`specs/001-login-billetera/`](specs/001-login-billetera/) y
[`specs/002-registro-usuarios/`](specs/002-registro-usuarios/).

## Requisitos

- Node.js 20 LTS o superior y npm 10 o superior.

## Configuración

```bash
npm install
cp .env.example .env.local
```

Edita `.env.local` y define al menos una cuenta **ficticia** en `VITE_DEMO_USERS`:

```dotenv
VITE_DEMO_USERS=[{"email":"tu.correo@example.com","password":"minimo-8-caracteres","displayName":"Tu Nombre"}]
```

- `password`: de 8 a 128 caracteres. `displayName`: de 1 a 80 caracteres, solo letras, espacios,
  `'`, `.` y `-` (las mismas reglas que el nombre del registro). Los correos no se pueden repetir.
  Si una cuenta no cumple las reglas, se ignora toda la configuración.
- `.env.local` no se versiona: la Constitución del proyecto (regla 5.3) prohíbe credenciales en el
  código fuente o en archivos versionados.
- ⚠️ Al ser una aplicación solo-cliente, el valor de `VITE_DEMO_USERS` queda incluido en el bundle
  compilado. Usa únicamente cuentas ficticias.
- Si la variable falta o es inválida, el login muestra "Servicio de acceso no disponible" y el
  registro "Servicio de registro no disponible".
- Las cuentas creadas en `/registro` viven solo en memoria: sirven para iniciar sesión hasta que
  se recarga la página. Nada se guarda en el navegador.

## Despliegue

La app usa direcciones reales (`/login`, `/registro`). El servidor debe devolver `index.html` para
cualquier ruta; `npm run dev` y `npm run preview` ya lo hacen. Sin esa regla de reescritura,
abrir `/registro` directamente da 404.

## Scripts

| Comando                           | Descripción                                                                                                                                           |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run dev`                     | Servidor de desarrollo en <http://localhost:5173>                                                                                                     |
| `npm run build`                   | Typecheck y build de producción en `dist/`                                                                                                            |
| `npm run preview`                 | Sirve el build de producción                                                                                                                          |
| `npm test`                        | Ejecuta las pruebas una vez                                                                                                                           |
| `npm run test:watch`              | Pruebas en modo observación                                                                                                                           |
| `npm run test:coverage`           | Pruebas con cobertura (umbral: 80 %)                                                                                                                  |
| `npm run lint` / `npm run format` | ESLint / Prettier                                                                                                                                     |
| `npm run verify`                  | Todos los controles de cumplimiento: lint, formato, tipos, pruebas con cobertura, build, auditoría de dependencias y licencias, y escaneo de secretos |

## Arquitectura

Clean Architecture ligera. Las dependencias apuntan hacia el dominio y ESLint lo verifica:

```text
src/
├── domain/          # Tipos, reglas de validación y textos. Sin React.
├── application/     # Casos de uso `authenticate` y `register`, puertos `AuthGateway` y `RegistrationGateway`
├── infrastructure/  # `InMemoryAccounts` (cuentas compartidas), gateways en memoria (simulación, 1 s)
│                    # y `loadDemoAccounts`
├── ui/
│   ├── styles/      # Tokens de Figma (color, tipografía, espaciado) y estilos globales
│   ├── routing/     # Router mínimo sobre la History API: `useRoute`, `navigate`, `Link`
│   ├── forms/       # Helpers compartidos por los formularios
│   ├── components/  # Button, TextField, PasswordField, Checkbox, SocialButton, Divider, Alert,
│   │                # FormHeading, FormFooter
│   ├── layout/      # AuthLayout (dos paneles) y BrandPanel
│   └── features/    # login/ y register/: pantalla, formulario, reducer y hook
├── App.tsx
└── main.tsx         # Raíz de composición (inyección de dependencias)
```

Las pruebas viven junto al código (`*.test.ts(x)`). Cada caso se nombra con el escenario o
requisito que verifica (por ejemplo, `US2-1`, `FR-012`) para mantener la trazabilidad.

## Notas de diseño

- **Contraste (pendiente de aprobación de diseño):** varios colores de Figma no alcanzan
  WCAG 2.1 AA (botón 2.83:1, enlaces 3.56:1, textos secundarios 3.28:1, bordes 1.40:1). Se
  usan variantes más oscuras del mismo tono (`--brand-700`, `--neutral-600`, `--neutral-border`
  en `src/ui/styles/tokens.css`). Detalle en `specs/001-login-billetera/research.md` (R3).
- Los iconos de Google, Apple y del control de visibilidad son los marcadores de posición del
  diseño de Figma.
- El panel de marca del registro usa el degradado de su frame (`--brand-gradient-register`),
  distinto al del login; pendiente de confirmación de diseño.
- Fuera de alcance: recuperar contraseña, acceso con Google/Apple, texto legal de los términos,
  persistencia de "Recordarme" y bloqueo por intentos fallidos. Al activarlos se muestra un aviso.
- **Excepción temporal (Constitución 9.1):** no hay registro estructurado de eventos de seguridad
  ni métricas (reglas 5.5 y 8.7). Vence el 2027-03-31 o con el primer backend; ver
  `specs/002-registro-usuarios/plan.md`.
