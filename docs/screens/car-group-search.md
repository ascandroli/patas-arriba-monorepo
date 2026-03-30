# Car Group Search — `/event/:eventId/search-car-group`

## Purpose

Browse and join available car groups for an event.

## Elements

- "volver" back link → `/event/:eventId`
- **If no available cars**: warning alert + "Volver" button
- **If cars available**:
  - Heading: "Coches disponibles"
  - Car group cards showing: owner username, pickup location, pickup time, available seats
  - Each card has a `+` button to select it (turns to checkmark when selected)
  - Join button: "Selecciona un grupo de coche" (disabled) / "Unete al grupo de coche!" (enabled when selected)

## Behavior

- Only shows car groups with available seats
- Clicking `+` selects a car group; clicking join sends PATCH request
- On success: navigates back to event details
- On error: redirects to `/server-error`

## Access

- Authenticated event attendees only