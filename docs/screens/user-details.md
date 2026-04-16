# User Details — `/user/:userId`

## Purpose

View another user's profile. Organizers/admins can approve pending users.

## Elements

- "volver" back link
- User card: avatar, username, full name
- Role badge (if admin or organizer)
- Phone number
- Registration date
- **For organizer/admin viewing a pending user**:
  - "Pendiente por permiso" warning
  - "Permitir acceso a la pagina" button → activates user (sets role to `user`)
- **For organizer/admin viewing an active user**:
  - "Usuario habilitado" success message

## Behavior

- Approve button sends PATCH to update role from `pending` to `user`

## Access

- Authenticated users (any role can view); approval action is organizer/admin only