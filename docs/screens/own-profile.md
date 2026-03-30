# Own Profile — `/user/own`

## Purpose

View and edit your own profile.

## Elements

- "volver" back link
- Large user avatar icon with "Cambiar imagen" edit button
- **Username** with edit button → inline edit form
- **Nombre** (full name) with edit button → inline edit form
- **Correo** (email) — read-only
- **Telefono** (phone) — read-only
- Info alert: contact admin to change email or phone
- **Registration date**
- **Notification settings** section (push notification toggle)

## Behavior

- Username edit: validates 3-15 chars, no spaces, uniqueness check
- Full name edit: validates 3-30 chars, letters and spaces only
- Icon edit: opens icon/color picker
- All edits are inline (no separate page)

## Access

- Authenticated users only