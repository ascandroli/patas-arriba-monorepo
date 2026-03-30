# Navbar (global component)

## Purpose

Main navigation via a hamburger menu drawer. Present on all screens.

## Elements

### Top bar

- Hamburger menu button (left)
- **Logged in**: username, role label ("Admin" or "Organizador"), profile icon link → `/user/own`

### Drawer menu

**Anonymous:**
- Inicio → `/`
- Registro → `/signup`
- Acceso → `/login`

**Logged-in user:**
- Inicio → `/`
- Tu Perfil → `/user/own`
- Eventos → `/event`
- Glosario → `/glossary`
- Cerrar Sesion (logout → clears token, redirects to `/`)

**Organizer/Admin (additional, below divider):**
- Crear Evento → `/event/create`
- Ver Usuarios → `/user`

## Behavior

- Drawer opens on hamburger click, closes on item click or outside click
- Logout clears `authToken` from localStorage and re-authenticates (resets state)