# Event Manage — `/event/:eventId/manage`

## Purpose

Manage event participants: view by car group, assign tasks, mark attendance.

## Elements

- "evento" back link → `/event/:eventId`
- Heading with event title and date
- Warning: if event is not yet closed, advises to close first before managing
- Three tab buttons (shown based on event settings):
  - **Participantes por coches** (if car organization enabled) — shows attendees grouped by car group
  - **Asignar tareas** (if task assignments enabled) — assign tasks to individual attendees
  - **Marcar asistencia** — mark each attendee as show/no-show/excused

## Behavior

- Fetches event details, attendees, and car groups
- Task and attendance updates via PATCH endpoints

## Access

- Admin or event owner only