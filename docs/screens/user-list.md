# User List — `/user`

## Purpose

View and manage all platform users.

## Elements

- **Pending users section** (if any): heading "Por aprobacion", user cards for pending users
- **Users section**: heading "Usuarios", search bar, user cards for approved users

## User Card

Shows: avatar icon, username, full name. Clicking navigates to `/user/:userId`.

## Behavior

- Search filters by username or full name (client-side)
- Pending users shown at top, separated by divider

## Access

- Organizer or Admin only