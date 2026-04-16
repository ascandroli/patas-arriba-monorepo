# Car Group Details — `/car-group/:carGroupId`

## Purpose

View full car group information, members, and car group message board.

## Elements

- "evento" back link → `/event/:eventId`
- Heading: "Detalles del grupo de coche"
- Car info card:
  - Title: "Tu coche" (if owner) or "Coche de {username}" (if passenger)
  - Edit button (owner only) → `/car-group/:carGroupId/edit`
  - **Lugar de recogida**
  - **Hora de recogida**
  - **Marca de coche**
  - **Color de coche**
  - **Plazas aun disponibles** (total - passengers count)
- Collapsible passenger list: "Conductor y pasajeros: {count}"
  - Shows driver (owner) and all passengers with user cards
- **Car group message board**
- **Leave button** (passengers only, not the owner)

## Behavior

- Only accessible to car group members (owner, passengers) and organizer/admin
- Phone numbers visible for coordination

## Access

- Car group members, organizer, or admin