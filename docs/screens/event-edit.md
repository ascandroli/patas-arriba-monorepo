# Event Edit — `/event/:eventId/edit`

## Purpose

Edit an existing event's details, status, or delete it.

## Elements

- "volver" back link
- Heading: "Que quieres editar el evento?"
- Four tab buttons:
  - **Info basica** — edit title, category, location, date, car/task toggles
  - **Info org.** — edit event description
  - **Estado** (warning color) — change status: open/closed/cancelled
  - **Eliminar** (error color) — delete event and all associated data

## Behavior

- Fetches event data for editing on mount
- Each tab renders a different sub-form
- Delete removes the event plus all attendees, car groups, and messages

## Access

- Organizer or Admin only