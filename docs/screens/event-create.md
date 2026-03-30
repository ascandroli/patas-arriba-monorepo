# Event Create — `/event/create`

## Purpose

Create a new event.

## Elements

- Heading: "Crear Evento"
- Form fields (all required):
  - **Categoria** — dropdown: Protectora, Recogida, Mercadillo, Otro
  - **Titulo** — max 50 characters
  - **Lugar** — max 50 characters
  - **Fecha** — date picker
  - **Hora** — time picker
  - **Requiere grupos de coches?** — dropdown: Si/No (with warning alert when No)
  - **Requiere asignar tareas a participantes?** — dropdown: Si/No (with warning alert when No)
- Submit button: "Crear Evento" (disabled until all fields valid)

## Behavior

- On success: redirects to `/event/:createdEventId`
- Creator is automatically added as an attendee
- Push notifications sent to all other users
- On error: redirects to `/server-error`

## Access

- Organizer or Admin only
