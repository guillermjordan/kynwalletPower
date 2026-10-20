# Contract: Interfaz de usuario del registro y navegación

Contrato observable por el usuario y por las pruebas (RTL consulta por rol y nombre accesible).
Textos exactos del frame `04 · Registro` (nodo `31:2`) y de la spec.

## Rutas

| Dirección | Pantalla | Notas |
|---|---|---|
| `/login` | Login (001) | Muestra el aviso de registro exitoso si corresponde |
| `/registro` | Registro | |
| `/` o cualquier otra | Se reemplaza por `/login` (`replaceState`, sin entrada nueva en el historial) | FR-002 |

Navegar entre pantallas no recarga la página. Atrás y adelante muestran la pantalla de cada
dirección. Al llegar por navegación interna, el foco va al `h1` de la pantalla nueva.

## Vista de registro

| Elemento | Rol / nombre accesible | Notas |
|---|---|---|
| Título | `heading` nivel 1 "Crea tu cuenta" | `tabIndex=-1`; subtítulo "Completa tus datos para comenzar" |
| Nombre | `textbox` "Nombre completo" | `autocomplete=name`, placeholder "Ej: Diego Martínez" |
| Correo | `textbox` "Correo electrónico" | `type=email`, `autocomplete=email`, placeholder "tucorreo@ejemplo.com" |
| Contraseña | campo con etiqueta "Contraseña" | `autocomplete=new-password`, placeholder "••••••••" |
| Confirmación | campo con etiqueta "Confirmar contraseña" | `autocomplete=new-password`, placeholder "••••••••" |
| Visibilidad (×2) | `button` "Mostrar contraseña" / "Ocultar contraseña" | Uno por campo; `aria-pressed` |
| Términos | `checkbox` "Acepto los términos y condiciones" | Con error: `aria-invalid` y `aria-describedby` |
| Enlace a términos | `button` "términos y condiciones" | Dentro de la etiqueta; muestra "Próximamente" y NO cambia la casilla |
| Enviar | `button` "Crear cuenta" | En carga: `aria-busy=true`, deshabilitado, texto "Creando cuenta…" |
| Separador | texto "o regístrate con" | Decorativo |
| Google / Apple | `button` "Google", `button` "Apple" | Muestran "Próximamente" |
| Ir al login | `link` "Inicia sesión" (`href=/login`) precedido por "¿Ya tienes cuenta?" | |

**Errores por control**: texto bajo el control, vinculado con `aria-describedby`; el control
lleva `aria-invalid=true`. Textos en [data-model.md](../data-model.md#registrationform-dominio-valor).

**Mensajes globales** (debajo de la casilla de términos, antes del botón):

| Caso | Rol | Texto |
|---|---|---|
| Correo ya registrado | `alert` | "Ya existe una cuenta con este correo" |
| No disponible | `alert` | "Servicio de registro no disponible. Intenta más tarde." |
| Google, Apple, términos | `status` | "Próximamente" (debajo de los botones sociales, como en el login) |

**Teclado**: nombre → correo → contraseña → visibilidad → confirmación → visibilidad → casilla →
"términos y condiciones" → "Crear cuenta" → Google → Apple → "Inicia sesión". Enter en cualquier
campo de texto envía el formulario.

## Panel de marca del registro

Logo "KynWallet", titular "Comienza tu / camino financiero." (dos líneas), texto de apoyo "Crea
tu cuenta en minutos y empieza a enviar, recibir y administrar tu dinero desde cualquier lugar."
y la tarjeta ilustrativa (`aria-hidden=true`). Degradado `--brand-gradient-register`. Por
debajo de 960px el panel no se muestra.

## Cambios en la vista de login (001)

| Elemento | Antes | Ahora |
|---|---|---|
| "Regístrate" | `button`; muestra "Función no disponible en esta demostración" | `link` "Regístrate" (`href=/registro`) |
| Aviso de registro | — | `status` "Cuenta creada con éxito. Ya puedes iniciar sesión." bajo el título; desaparece al editar un campo |
| Título | `h1` | `h1` con `tabIndex=-1`; recibe el foco al llegar por navegación interna |
