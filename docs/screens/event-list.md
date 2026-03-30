# Event List — `/event`

## Purpose

Browse all events with filtering by time frame.

## Elements

- Heading: "Aqui podras ver todos los eventos proximos y mas recientes"
- Toggle buttons:
  - **Proximos** (upcoming, default) — contained style when active
  - **Pasados** (past) — contained style when active
- Event cards list (or "No se han encontrado eventos" if empty)
- Loading spinner while fetching

## Event Card

Each card shows: title, category, location, date, attendee count, available car seats.

Clicking a card navigates to `/event/:eventId`.

## Behavior

- Fetches all events from API on mount
- Client-side filtering: upcoming = date >= today, past = date < today (reversed)
- On API error: redirects to `/server-error`

## Access

- Authenticated users only (redirects to `/login` if anonymous)