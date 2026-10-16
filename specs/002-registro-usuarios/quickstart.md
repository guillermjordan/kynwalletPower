# Quickstart: Pantalla de Registro de Usuarios de KynWallet

La instalación, la configuración de `VITE_DEMO_USERS` y los comandos son los mismos de
[001 quickstart](../001-login-billetera/quickstart.md). Aquí solo se agrega lo nuevo.

## Ejecutar

```bash
npm run dev        # http://localhost:5173/registro y http://localhost:5173/login
npm run verify     # todos los controles de la Constitución 9.4; cobertura ≥ 80 %
```

> **Hosting de producción**: la app usa direcciones reales (`/registro`). El servidor debe
> devolver `index.html` para cualquier ruta (en Vite `dev` y `preview` ya ocurre). Sin esa regla,
> abrir `/registro` directamente da 404.

## Escenarios de validación manual

Siendo `<demo>` un correo definido en `.env.local`:

| # | Acción | Resultado esperado | Spec |
|---|---|---|---|
| 1 | Abrir `/registro`, completar todo con datos válidos, marcar términos y presionar "Crear cuenta" | Botón en carga ~1 s; luego `/login` con "Cuenta creada con éxito. Ya puedes iniciar sesión." | US1-1, US1-2 |
| 2 | Iniciar sesión con el correo y la contraseña recién registrados | Bienvenida con el nombre completo | US1-3 |
| 3 | En `/login` con el aviso visible, escribir en un campo | El aviso desaparece | US1-4 |
| 4 | Recargar la página después del escenario 1 e intentar iniciar sesión con la cuenta nueva | "Correo o contraseña incorrectos" (la cuenta se perdió) | FR-012 |
| 5 | Presionar "Crear cuenta" con todo vacío | Cinco errores; foco en "Nombre completo" | US2-1 |
| 6 | Contraseña "clave-segura-1" y confirmación "clave-segura-2", salir del campo | "Las contraseñas no coinciden"; al corregir, desaparece | US2-4, US2-5 |
| 7 | Todo válido sin marcar términos | "Debes aceptar los términos y condiciones"; foco en la casilla | Edge case |
| 8 | Registrar `<demo>` en mayúsculas | "Ya existe una cuenta con este correo"; nombre y correo conservados, contraseñas vacías | US4 |
| 9 | Doble clic rápido en "Crear cuenta" con datos válidos | Se crea una sola cuenta | Edge case |
| 10 | Nombre "R2-D2" | "Ingresa un nombre válido" | FR-004 |
| 11 | Activar Google, Apple y "términos y condiciones" | "Próximamente"; la casilla no cambia | US6 |
| 12 | "Inicia sesión" desde el registro, "Regístrate" desde el login, y luego atrás/adelante | Cada dirección muestra su pantalla; el foco va al título | US3 |
| 13 | Abrir `/` y `/cualquier-cosa` | Se muestra `/login` | US3-5 |
| 14 | Ventana a 320px en `/registro` | Solo el formulario, sin scroll horizontal | US5, FR-022 |
| 15 | Ventana de escritorio en `/registro` | Dos paneles; titular "Comienza tu camino financiero." | US5-1, FR-001 |
| 16 | Borrar `VITE_DEMO_USERS`, reiniciar e intentar registrarse | "Servicio de registro no disponible. Intenta más tarde." | FR-023 |
| 17 | Recorrer `/registro` solo con Tab y Enter | Orden según [contracts/ui-register.md](./contracts/ui-register.md#vista-de-registro); foco visible | FR-020 |
