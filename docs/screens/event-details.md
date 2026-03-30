# Event Details — `/event/:eventId`

## Purpose

View full event information, join/leave event, access car groups and messages.

## Elements

- "volver" back link → `/event`
- Cancelled/closed status banners (if applicable)
- Event card with full details and available car seats count
- **"Gestiona los participantes"** button (admin or event owner only) → `/event/:eventId/manage`

### Before joining

- **"Unete al evento!"** button (disabled if event is closed/cancelled/past)
- Admin info: can see all info without joining

### After joining

- Success message: "Ya estas apuntado al evento!"
- **Event description** (collapsible)
- **Participants list** (collapsible)
- **Car groups list** (collapsible, only if event has car organization)
- **Car group info card:**
  - If user has a car group: shows "Ya tienes un coche asignado!" with link to car group details
  - If user has no car group: shows warning + two buttons:
    - "Voy con mi coche" → `/event/:eventId/add-car-group`
    - "Buscar coche" → `/event/:eventId/search-car-group`
- **Task assignment** (if event has task assignments)
- **Event message board** (visible to attendees and admins)
- **Leave event button** at the bottom

## Behavior

- Fetches event details, car groups, and messages on mount
- Joining: POST to `/attendee/:eventId`, updates UI immediately
- Leaving: DELETE to `/attendee/:eventId`, also removes from car group
- Past events: join button disabled, shows "este evento ya ha pasado"

## Access

- Authenticated users only