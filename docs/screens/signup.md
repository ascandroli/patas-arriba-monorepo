# Signup — `/signup`

## Purpose

Register a new volunteer account.

## Elements

- "volver" back link → `/`
- Heading: "Registro"
- Form fields (all required):
  - **Correo Electronico** — email format validation
  - **Nombre de Usuario** — 3-15 chars, no spaces
  - **Nombre Completo** — 3-30 chars, letters and spaces only
  - **Codigo** — country phone code dropdown (default: Spain +34)
  - **Numero de Movil** — 7-15 digits only
  - Warning alert: phone number may be shared with other volunteers
  - **Contrasena** — min 6 chars, 1 number, 1 lowercase, 1 uppercase
  - **Confirmar Contrasena** — must match password
- Submit button: "registrate" (disabled until all fields valid)
- Info alert: after registering, contact an admin to activate the account
- Link: "Si ya tienes cuenta, accede aqui" → `/login`

## Behavior

- Client-side validation with inline error messages on blur
- Server-side uniqueness checks: email, username, phone number
- On success: redirects to `/login`
- On server error (non-400): redirects to `/server-error`

## Access

- Anonymous only (logged-in users redirected to `/`)