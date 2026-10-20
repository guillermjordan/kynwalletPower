# Feature Specification: Pantalla de Registro de Usuarios de KynWallet

**Feature Branch**: `002-registro-usuarios` (trabajo en la rama `feature/registro-guillermo-jordan`)

**Created**: 2026-10-16

**Status**: Draft

**Input**: User description: "Construye la pantalla de Registro de Usuarios de KynWallet basada en
el frame "04 · Registro" de Figma:
<https://www.figma.com/design/AtXTxOsBbISgGtDp0rk4kf/Billetera-Virtual---Prototipos--Copy-?node-id=0-1>
El usuario PUEDE crear una cuenta con nombre completo, correo, contraseña y confirmación. Debe
aceptar términos y condiciones. El botón "Crear cuenta" valida todo antes de enviar. Validaciones
inline: campos obligatorios, correo válido, contraseña de mínimo 8 caracteres, contraseñas
coincidentes. Google y Apple muestran alert "Próximamente". El link "¿Ya tienes cuenta? Inicia
sesión" lleva a /login. Un registro exitoso redirige a /login con mensaje de éxito. Responsive:
desktop con 2 paneles, mobile solo formulario."

**Diseño de referencia**: Figma, archivo `AtXTxOsBbISgGtDp0rk4kf` (copia del archivo de
prototipos), frame `04 · Registro` (nodo `31:2`, 1440 × 1024, solo escritorio). Verificado contra el
frame el 2026-10-16. Se compone de:

- **Panel de marca** (izquierda, 620 px de ancho, degradado naranja): logo "KynWallet", titular
  "Comienza tu camino financiero.", texto de apoyo "Crea tu cuenta en minutos y empieza a enviar,
  recibir y administrar tu dinero desde cualquier lugar." y la tarjeta ilustrativa "Kyn Card"
  (igual a la del login). Es la misma estructura que `01 · Login`, con otros textos.
- **Panel de formulario** (derecha, fondo blanco, columna de 400 px), en este orden:
  1. Título "Crea tu cuenta" y subtítulo "Completa tus datos para comenzar".
  2. Campo "Nombre completo", ejemplo "Ej: Diego Martínez".
  3. Campo "Correo electrónico", ejemplo `tucorreo@ejemplo.com`.
  4. Campo "Contraseña", con control de visibilidad.
  5. Campo "Confirmar contraseña", con control de visibilidad.
  6. Casilla "Acepto los términos y condiciones", donde "términos y condiciones" se destaca como
     enlace.
  7. Botón principal "Crear cuenta".
  8. Separador "o regístrate con".
  9. Botones "Google" y "Apple", uno al lado del otro.
  10. Pie "¿Ya tienes cuenta?" seguido del enlace "Inicia sesión".

El frame no muestra estados de error, de carga ni de éxito, ni una versión móvil; esos estados se
definen en esta especificación siguiendo el patrón visual del login (ver Assumptions).

**Relación con otras features**: amplía `001-login-billetera`. El enlace "Regístrate" del login,
que hoy informa "Función no disponible en esta demostración" (001, FR-016), pasa a llevar a esta
pantalla, y el login pasa a mostrar el mensaje de registro exitoso.

## Clarifications

### Session 2026-10-16

- Q: Ante un correo ya registrado, ¿mensaje específico o genérico? → A: Mensaje específico "Ya
  existe una cuenta con este correo". Se acepta que revela si un correo tiene cuenta (desviación
  justificada de la Constitución 5.4): es una demo solo-cliente con cuentas ficticias y sin datos
  reales, y el mensaje evita que el usuario quede sin saber cómo continuar.
- Q (reevaluación en la revisión del plan): ¿cambiar a un mensaje genérico o a una respuesta de
  éxito idéntica para cumplir 5.4? → A: Se mantiene el mensaje específico. Un mensaje genérico no
  evita la enumeración porque el comportamiento difiere, y la respuesta de éxito idéntica
  perjudica a quien ya tenía cuenta.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Crear una cuenta con datos válidos (Priority: P1)

Como persona que aún no usa KynWallet, quiero registrarme con mi nombre completo, mi correo y una
contraseña, para luego poder iniciar sesión en la billetera.

**Why this priority**: es el propósito central de la pantalla; sin este flujo no existe valor
demostrable.

**Independent Test**: se completan todos los campos con datos válidos, se aceptan los términos,
se presiona "Crear cuenta" y se verifica que la aplicación lleva a `/login` con el mensaje de
éxito.

**Acceptance Scenarios**:

1. **Given** la pantalla de registro en `/registro`, **When** el usuario completa nombre completo,
   correo, contraseña y confirmación válidos, acepta los términos y presiona "Crear cuenta",
   **Then** la aplicación navega a `/login` y muestra el mensaje "Cuenta creada con éxito. Ya
   puedes iniciar sesión.".
2. **Given** el usuario envió el formulario con datos válidos, **When** el registro simulado está
   en curso, **Then** el botón "Crear cuenta" muestra un estado de carga, queda deshabilitado y no
   admite envíos adicionales.
3. **Given** un registro exitoso, **When** el usuario inicia sesión en la misma visita con el
   correo y la contraseña registrados, **Then** accede y ve la bienvenida con el nombre completo
   que ingresó.
4. **Given** el mensaje de éxito visible en `/login`, **When** el usuario recarga la página o
   empieza a escribir en el formulario de login, **Then** el mensaje deja de mostrarse.
5. **Given** el usuario escribe el correo con mayúsculas o espacios al inicio o al final, **When**
   se registra, **Then** la cuenta queda asociada al correo sin espacios y en minúsculas.
6. **Given** el usuario está en cualquier campo de texto, **When** presiona Enter, **Then** el
   formulario se envía igual que al presionar "Crear cuenta".

---

### User Story 2 - Validar los datos en línea antes de enviar (Priority: P1)

Como usuario, quiero que el formulario me indique, junto a cada campo, qué dato falta o es
incorrecto, para corregirlo antes de crear la cuenta.

**Why this priority**: el requerimiento exige explícitamente las validaciones en línea y que
"Crear cuenta" valide todo antes de enviar; sin ellas se crearían cuentas inválidas.

**Independent Test**: se envía el formulario vacío y luego con datos inválidos campo por campo, y
se verifican los mensajes asociados a cada uno.

**Acceptance Scenarios**:

1. **Given** el formulario vacío, **When** el usuario presiona "Crear cuenta", **Then** se
   muestran "Ingresa tu nombre completo", "Ingresa tu correo electrónico", "Ingresa tu
   contraseña", "Confirma tu contraseña" y "Debes aceptar los términos y condiciones" junto a cada
   control, no se ejecuta el registro y el foco se mueve al primer control con error.
2. **Given** un correo sin formato válido (por ejemplo, "usuario@" o "usuario.com"), **When** el
   usuario sale del campo o envía el formulario, **Then** se muestra "Ingresa un correo electrónico
   válido".
3. **Given** una contraseña con menos de 8 caracteres, **When** el usuario sale del campo o envía
   el formulario, **Then** se muestra "La contraseña debe tener al menos 8 caracteres".
4. **Given** una confirmación distinta de la contraseña, **When** el usuario sale del campo de
   confirmación o envía el formulario, **Then** se muestra "Las contraseñas no coinciden".
5. **Given** el mensaje "Las contraseñas no coinciden" visible, **When** el usuario corrige la
   contraseña o la confirmación hasta que coincidan, **Then** el mensaje desaparece.
6. **Given** un campo que el usuario todavía no tocó, **When** escribe en otro campo, **Then** no se
   muestran errores en el campo no tocado.
7. **Given** un campo con error, **When** el usuario corrige el valor, **Then** el mensaje de ese
   campo desaparece.
8. **Given** un control con error, **When** es leído por un lector de pantalla, **Then** se anuncia
   el mensaje de error asociado a ese control.

---

### User Story 3 - Navegar entre registro e inicio de sesión (Priority: P2)

Como usuario, quiero pasar del login al registro y del registro al login, para usar la pantalla
que corresponde a mi situación.

**Why this priority**: conecta la nueva pantalla con la existente; el registro (P1) puede
demostrarse entrando directo a `/registro`.

**Independent Test**: desde `/registro` se activa "Inicia sesión" y se verifica `/login`; desde
`/login` se activa "Regístrate" y se verifica `/registro`.

**Acceptance Scenarios**:

1. **Given** la pantalla de registro, **When** el usuario activa "¿Ya tienes cuenta? Inicia
   sesión", **Then** la aplicación navega a `/login` sin mensaje de éxito y sin conservar los datos
   escritos en el registro.
2. **Given** la pantalla de login, **When** el usuario activa "Regístrate", **Then** la aplicación
   navega a `/registro` con el formulario vacío.
3. **Given** el usuario navegó entre ambas pantallas, **When** usa los botones atrás y adelante
   del navegador, **Then** se muestra la pantalla correspondiente a cada dirección.
4. **Given** el usuario abre directamente la dirección `/registro` o `/login`, **When** la página
   carga, **Then** se muestra la pantalla correspondiente.
5. **Given** el usuario abre la raíz del sitio o una dirección inexistente, **When** la página
   carga, **Then** se muestra la pantalla de login en `/login`.

---

### User Story 4 - Rechazar un correo ya registrado (Priority: P2)

Como usuario, quiero saber si no se pudo crear la cuenta porque el correo ya está en uso, para
iniciar sesión en lugar de registrarme de nuevo.

**Why this priority**: evita cuentas duplicadas; el flujo principal es demostrable sin este caso.

**Independent Test**: se intenta registrar el correo de una cuenta de demostración existente y se
verifica el mensaje y que no se navega a `/login`.

**Acceptance Scenarios**:

1. **Given** un correo que ya pertenece a una cuenta (de demostración o registrada en la misma
   visita, sin distinguir mayúsculas ni espacios), **When** el usuario envía el formulario con ese
   correo, **Then** el registro no se completa, la pantalla permanece en `/registro` y se muestra
   "Ya existe una cuenta con este correo".
2. **Given** el registro fue rechazado, **When** se muestra el mensaje, **Then** se conservan
   nombre y correo, se vacían contraseña y confirmación, y el mensaje desaparece al modificar
   cualquier campo.

---

### User Story 5 - Usar el registro en móvil y en escritorio (Priority: P2)

Como usuario, quiero que la pantalla de registro se vea completa tanto en el celular como en la
computadora, para registrarme desde cualquier dispositivo.

**Why this priority**: es un requisito explícito del diseño, pero no cambia el comportamiento del
flujo.

**Independent Test**: se abre `/registro` en un ancho de escritorio y en uno de 320 px y se verifica
la distribución de paneles y la ausencia de desplazamiento horizontal.

**Acceptance Scenarios**:

1. **Given** un ancho de escritorio, **When** se muestra el registro, **Then** se ven dos paneles:
   el de marca y el del formulario, como en el diseño.
2. **Given** un ancho de móvil, **When** se muestra el registro, **Then** solo se ve el formulario
   y todos sus controles se pueden usar sin desplazamiento horizontal desde 320 px.

---

### User Story 6 - Opciones aún no disponibles: Google, Apple y términos (Priority: P3)

Como usuario, quiero que los botones de Google y Apple, y el enlace a los términos y condiciones,
me informen que llegarán pronto, para no pensar que la pantalla falló.

**Why this priority**: mantiene la fidelidad al diseño sin ampliar el alcance (YAGNI).

**Independent Test**: se activa cada botón y se verifica el aviso.

**Acceptance Scenarios**:

1. **Given** la pantalla de registro, **When** el usuario activa "Google" o "Apple", **Then** se
   muestra el aviso "Próximamente", anunciado por tecnologías de asistencia, y el formulario
   conserva los datos ingresados.
2. **Given** la pantalla de registro, **When** el usuario activa el enlace "términos y
   condiciones", **Then** se muestra el aviso "Próximamente" y la casilla de aceptación no cambia
   de estado.

---

### Edge Cases

- El usuario presiona "Crear cuenta" varias veces seguidas o con doble clic: solo se procesa un
  intento y solo se crea una cuenta.
- Correo duplicado: el correo ya pertenece a una cuenta de demostración o a una creada en la misma
  visita, aunque se escriba con otras mayúsculas o con espacios periféricos: no se crea la cuenta
  y se muestra "Ya existe una cuenta con este correo" (US4, FR-013).
- Términos sin marcar: todos los campos son válidos pero la casilla no está marcada: no se ejecuta
  el registro, se muestra "Debes aceptar los términos y condiciones" y el foco va a la casilla.
- Campos con solo espacios: el nombre y el correo se tratan como vacíos y muestran el mensaje de
  campo obligatorio; en la contraseña los espacios cuentan como caracteres.
- Nombre con espacios al inicio o al final: se ignoran; un nombre formado solo por espacios se
  trata como vacío.
- Nombre con tildes, "ñ", apóstrofos o guiones (por ejemplo, "María José O'Neill-Núñez"): se
  acepta. Nombre con números u otros símbolos: se muestra "Ingresa un nombre válido".
- Nombre de más de 80 caracteres, correo de más de 254 o contraseña de más de 128: se rechaza con
  mensaje de validación y no se ejecuta el registro.
- Contraseña o confirmación con espacios: se respetan tal cual, sin recortarlos, al validar y al
  comparar.
- El usuario escribe primero la confirmación y después la contraseña: la coincidencia se evalúa
  con los valores actuales de ambos campos.
- El usuario pega texto en los campos: se acepta y se valida igual que el texto escrito.
- El usuario desmarca los términos después de haberlos aceptado: el formulario vuelve a exigirlos
  al enviar.
- El servicio de registro simulado falla: se muestra "Servicio de registro no disponible. Intenta
  más tarde." sin detalles internos y se conservan nombre y correo.
- El usuario sale del registro con datos escritos (enlace o botón atrás): los datos se descartan
  sin confirmación.
- Tras registrarse, el usuario recarga la página: la cuenta creada se pierde (no hay
  persistencia) y el mensaje de éxito no se vuelve a mostrar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La pantalla DEBE reproducir la estructura, el orden, los textos y la jerarquía
  visual del frame de Figma `04 · Registro` descritos en "Diseño de referencia", reutilizando los
  elementos visuales ya construidos para `01 · Login` (panel de marca, campos, casilla, botones,
  separador, avisos) y el sistema de diseño corporativo cuando exista. El panel de marca DEBE
  mostrar los textos propios del registro.
- **FR-002**: La aplicación DEBE ofrecer la pantalla de registro en la dirección `/registro` y la
  de inicio de sesión en `/login`; la raíz y las direcciones desconocidas DEBEN llevar a `/login`.
  Los botones atrás y adelante del navegador DEBEN funcionar entre ambas pantallas.
- **FR-003**: El formulario DEBE permitir ingresar nombre completo, correo electrónico, contraseña
  y confirmación de contraseña, y marcar la aceptación de términos y condiciones.
- **FR-004**: El nombre completo DEBE ser obligatorio, se valida sin espacios periféricos, DEBE
  tener como máximo 80 caracteres y DEBE contener solo letras (incluidas las acentuadas y la "ñ"),
  espacios, apóstrofos, guiones y puntos.
- **FR-005**: El correo DEBE ser obligatorio, tener formato de correo válido y no exceder 254
  caracteres, con las mismas reglas que el login (001, FR-003); se normaliza sin espacios
  periféricos y en minúsculas.
- **FR-006**: La contraseña DEBE ser obligatoria y tener entre 8 y 128 caracteres, con las mismas
  reglas que el login (001, FR-004), sin recortar espacios.
- **FR-007**: La confirmación DEBE ser obligatoria y coincidir exactamente con la contraseña; la
  coincidencia DEBE reevaluarse cuando cambie cualquiera de los dos campos.
- **FR-008**: La aceptación de términos y condiciones DEBE ser obligatoria para crear la cuenta.
- **FR-009**: Los mensajes de validación DEBEN mostrarse junto al control correspondiente, al
  salir de un campo ya tocado y al intentar enviar, y DEBEN ocultarse cuando el valor se corrija.
  Los textos son: "Ingresa tu nombre completo", "Ingresa un nombre válido", "El nombre no puede
  superar 80 caracteres", "Ingresa tu correo electrónico", "Ingresa un correo electrónico válido",
  "Ingresa tu contraseña", "La contraseña debe tener al menos 8 caracteres", "La contraseña no
  puede superar 128 caracteres", "Confirma tu contraseña", "Las contraseñas no coinciden" y "Debes
  aceptar los términos y condiciones".
- **FR-010**: "Crear cuenta" DEBE validar todos los campos antes de enviar; NO DEBE ejecutarse el
  registro mientras existan errores, y el foco DEBE moverse al primer control con error.
- **FR-011**: El registro DEBE simularse sin servicios backend ni base de datos, con una espera
  breve (aprox. 1 segundo) con indicador de carga, durante la cual el envío queda deshabilitado.
- **FR-012**: Una cuenta registrada DEBE poder usarse para iniciar sesión durante la misma visita
  y DEBE perderse al recargar o cerrar la página. NO DEBE guardarse en almacenamiento del
  navegador, archivos ni configuración.
- **FR-013**: El sistema NO DEBE crear una cuenta cuyo correo ya pertenezca a otra cuenta
  (comparado sin distinguir mayúsculas ni espacios periféricos). Ante ese caso DEBE mostrar "Ya
  existe una cuenta con este correo", conservar nombre y correo y vaciar contraseña y
  confirmación.
- **FR-014**: Tras un registro exitoso, la aplicación DEBE navegar a `/login` y mostrar el aviso
  "Cuenta creada con éxito. Ya puedes iniciar sesión.", anunciado por tecnologías de asistencia.
  El aviso DEBE mostrarse una sola vez y ocultarse al modificar el formulario de login.
- **FR-015**: Los datos del registro NO DEBEN viajar en la dirección (URL) al navegar a `/login`.
- **FR-016**: El enlace "¿Ya tienes cuenta? Inicia sesión" DEBE navegar a `/login`. El enlace
  "Regístrate" del login DEBE navegar a `/registro`, reemplazando el aviso de función no
  disponible (modifica 001, FR-016 y escenario US5-1, solo para "Regístrate").
- **FR-017**: Los botones "Google" y "Apple" y el enlace "términos y condiciones" DEBEN mostrarse
  según el diseño y, al activarse, mostrar el aviso "Próximamente" dentro de la pantalla, sin
  perder los datos ingresados ni cambiar el estado de la casilla de aceptación.
- **FR-018**: Los campos de contraseña y confirmación DEBEN ocultar los caracteres por defecto y
  ofrecer, cada uno, un control accesible para mostrarlos u ocultarlos.
- **FR-019**: El sistema NO DEBE registrar ni mostrar la contraseña en mensajes, registros de
  diagnóstico, URL ni almacenamiento del navegador.
- **FR-020**: El formulario DEBE poder enviarse con la tecla Enter y operarse completamente con
  teclado, con orden de foco lógico y foco visible.
- **FR-021**: La pantalla DEBE cumplir WCAG 2.1 nivel AA: etiquetas asociadas a cada control,
  errores y avisos anunciados por tecnologías de asistencia y contraste suficiente. Al cambiar de
  pantalla, el foco DEBE ubicarse al inicio del contenido nuevo (título del formulario).
- **FR-022**: En anchos de escritorio la pantalla DEBE mostrar dos paneles (marca y formulario);
  en anchos de móvil DEBE mostrar solo el formulario. NO DEBE haber desplazamiento horizontal
  desde 320 px.
- **FR-023**: Los errores inesperados del registro DEBEN mostrarse como "Servicio de registro no
  disponible. Intenta más tarde.", sin revelar detalles técnicos.

### Key Entities

- **Solicitud de registro**: datos ingresados en el formulario (nombre completo, correo,
  contraseña, confirmación y aceptación de términos) y su resultado: error de validación, correo
  en uso, servicio no disponible o cuenta creada. No se persiste.
- **Cuenta**: usuario que puede iniciar sesión. Atributos: correo (identificador único, sin
  distinguir mayúsculas), contraseña y nombre del titular. Incluye las cuentas de demostración de
  la configuración externa (001) y las creadas durante la visita, que solo viven en memoria.
- **Aviso de registro exitoso**: mensaje que el login muestra una única vez después de crear una
  cuenta. No contiene datos personales.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Un usuario completa el registro en menos de 90 segundos desde que la pantalla se
  muestra.
- **SC-002**: El resultado de un envío válido (navegación a `/login` o mensaje de error) se
  muestra en un máximo de 2 segundos tras presionar "Crear cuenta".
- **SC-003**: El 100 % de los escenarios de aceptación de las historias P1 y P2 se verifican
  mediante pruebas automatizadas que pasan, y las pruebas existentes del login siguen pasando.
- **SC-004**: El 90 % de los participantes de una prueba de usabilidad crea su cuenta e inicia
  sesión con ella en el primer intento sin asistencia.
- **SC-005**: La pantalla no presenta incumplimientos WCAG 2.1 AA en una auditoría automatizada de
  accesibilidad y es operable solo con teclado.
- **SC-006**: La revisión visual frente al frame `04 · Registro` no detecta diferencias en textos,
  orden de elementos ni jerarquía visual, en escritorio y en móvil.
- **SC-007**: El análisis de secretos no detecta credenciales en el código versionado, y ninguna
  contraseña aparece en la URL, en registros ni en el almacenamiento del navegador.

## Non-Goals

- Backend real: no hay servidor, base de datos ni API de registro; las cuentas creadas viven solo
  en memoria durante la visita.
- OAuth real con Google o Apple: los botones solo muestran "Próximamente".
- Verificación del correo (por ejemplo, enlace de confirmación) y envío de correos de bienvenida.
- Inicio de sesión automático después de registrarse: el usuario vuelve a `/login` y entra con sus
  datos.
- Texto legal de términos y condiciones: el enlace solo muestra "Próximamente".
- Reglas de complejidad de contraseña más allá de la longitud, e indicador de fortaleza.
- Protección contra registros automatizados (captcha, límites de intentos).

## Assumptions

- La demostración sigue siendo exclusivamente del lado del cliente: sin backend, base de datos ni
  sesión persistente (igual que 001).
- Los textos visibles del frame (títulos, etiquetas, ejemplos, botones, separador y pie) están
  confirmados contra el diseño. Los mensajes de error, el aviso de éxito y los avisos
  "Próximamente" no aparecen en el frame: los define esta especificación y se presentan con el
  mismo estilo que los mensajes y avisos del login.
- Algunos colores del frame no alcanzan el contraste AA (texto de ejemplo gris claro y enlaces
  naranjas de 14 px). Se usan los mismos tonos accesibles derivados que ya aplica el login, que
  siguen pendientes de aprobación de diseño (Constitución 8.4 y 8.6).
- En el frame, las dos líneas del separador "o regístrate con" tienen largos distintos y el pie
  está levemente descentrado; se interpretan como imprecisiones del prototipo y se muestran
  centrados, igual que en el login.
- El frame usa separaciones verticales más compactas que el login (16 px entre campos frente a
  22 px); se respetan las del frame para que el formulario, más largo, entre en la pantalla.
- "Alert 'Próximamente'" se interpreta como un aviso dentro de la pantalla (igual que los avisos
  del login), no como un diálogo del navegador, porque los diálogos nativos bloquean la página y
  no siguen el sistema de diseño.
- El enlace "términos y condiciones" del frame se muestra por fidelidad al diseño y al activarse
  informa "Próximamente", sin marcar ni desmarcar la casilla; el texto legal queda fuera del
  alcance.
- La dirección de la pantalla de registro es `/registro` (la descripción solo fija `/login`).
- El nombre completo no exige un número mínimo de palabras; se valida solo que no esté vacío, su
  longitud y sus caracteres permitidos.
- Las reglas de correo y contraseña son las mismas del login (correo ≤ 254 caracteres; contraseña
  de 8 a 128 caracteres sin reglas de complejidad adicionales), para que exista una única política.
- Los campos de contraseña del registro tienen el mismo control de visibilidad que el login.
- El panel de marca del registro tiene la misma estructura que el del login, con su propio titular
  y texto de apoyo; en móvil se oculta por completo, como pide la descripción ("solo
  formulario"). El frame no tiene versión móvil, así que esa adaptación se deriva del diseño de
  escritorio.
- El aviso del login para Google y Apple ("Función no disponible en esta demostración") no se
  modifica en esta feature.
- El idioma de la interfaz es español.
- No existen BRD ni ARD para esta funcionalidad; si se incorporan, esta especificación DEBE
  alinearse con ellos (Constitución, Principio VI).
