# Login — `/login`

## Purpose

Authenticate an existing user.

## Elements

- "volver" back link → `/`
- Heading: "Acceso"
- Form fields:
  - **Correo Electronico o Nombre de Usuario** — required
  - **Contrasena** — required, with show/hide toggle button
- Submit button: "Accede" (disabled until both fields filled)
- Error alert: shows server error messages (auto-dismiss after 5s)
- Link: "Olvidaste tu contrasena?" → `/password-forget`
- Link: "Si no tienes cuenta, registrate aqui" → `/signup`

## Behavior

- Server validates credentials and returns JWT
- JWT stored in `localStorage`
- On success: redirects to `/`
- Error cases:
  - User not found → error on credential field
  - Wrong password → error on password field
  - Pending user → error message about contacting admin
- On server error (non-400/401): redirects to `/server-error`

## Access

- Anonymous only (logged-in users redirected to `/`)