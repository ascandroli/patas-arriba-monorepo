# Car Group Edit — `/car-group/:carGroupId/edit`

## Purpose

Edit or delete a car group.

## Elements

- "volver" back link → `/car-group/:carGroupId`
- Heading: "Como quieres editar el grupo de coche?"
- Two tab buttons:
  - **Editar info** — form to update pickup location, time, seats, car brand, color
  - **Eliminar** (error color) — delete the car group

## Behavior

- Cannot reduce seats below current passenger count
- Delete only allowed if event is open (not closed or cancelled)
- On success: navigates back

## Access

- Car group owner only