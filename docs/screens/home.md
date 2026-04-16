# Home — `/`

## Purpose

Landing page. Shows different content based on authentication state.

## Anonymous View

- Foundation logo (300px wide)
- Welcome text: "En esta pagina podras ver y participar en eventos de la fundacion Patas Arriba"
- "Registrate" button → navigates to `/signup`
- "Inicia Sesion" button → navigates to `/login`

## Logged-in View

- Upcoming events list (`UpcomingEventsList` component)
- No logo or welcome text

## Access

- Public (all users)