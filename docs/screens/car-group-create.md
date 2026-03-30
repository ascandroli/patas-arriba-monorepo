# Car Group Create — `/event/:eventId/add-car-group`

## Purpose

Create a new car group (offer your car) for an event.

## Elements

- "volver" back link → `/event/:eventId`
- Heading: "Crea un grupo de coche"
- Info alert: "Todos los campos se pueden modificar luego"
- Form fields (all required):
  - **Plazas disponibles** — number input
  - **Marca y modelo del coche** — text
  - **Color del coche** — text
  - **Direccion de recogida** — text
  - **Hora de recogida** — time picker (helper: "La fecha sera la del evento")
- Submit button: "Crear Grupo de coche" (disabled until all fields filled)

## Behavior

- User must be an attendee of the event
- User must not already own or be in a car group for this event
- On success: redirects to `/event/:eventId`

## Access

- Authenticated event attendees only