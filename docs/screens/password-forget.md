# Password Forget — `/password-forget`

## Purpose

Request a password reset email.

## Elements

- "volver" back link → `/`
- Heading: "Solicitar recuperacion de contrasena"
- Instructions text about entering email
- **Correo Electronico** field — required
- Submit button: "enviar" (disabled until field filled)
- Error alert: user not found
- Success alert: email sent confirmation with sender address info

## Behavior

- On success: shows success alert (stays on page)
- On error 400: shows inline error
- On server error: redirects to `/server-error`

## Access

- Anonymous only