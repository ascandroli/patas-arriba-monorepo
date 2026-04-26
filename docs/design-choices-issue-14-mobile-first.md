# Design Choices — Issue #14: Mobile-First Audit

## Summary

Audit of the frontend UI from a mobile-first perspective. The app is a PWA targeting volunteers who primarily use it on their phones, but the current experience has several desktop-first patterns that make it feel awkward on mobile. MUI is fully capable for mobile-first — the issues are in how it's used, not the framework itself.

## Audit Findings

### Critical

| # | Issue | Where | Impact |
|---|-------|-------|--------|
| 1 | **Hamburger drawer as only navigation** | `Navbar.jsx` | Primary destinations (Events, Profile) hidden behind a tap — breaks mobile-first best practice for a PWA |
| 2 | **Touch targets under 48px** | Message delete button (`size='small'` ~40px), Glossary toggles (`size='small'` ~36px), Glossary chips (`size='small'` ~32px), UserSearch input (40px height) | Fails Material Design minimum; frustrating on phones |
| 3 | **Fixed percentage button layouts** | `EventEdit.jsx` (4 buttons at 20%), `EventManage.jsx` (3 at 32%), `EventCarGroupInfoCard.jsx` (2 at 40%) | Wraps awkwardly or gets cramped below 360px |
| 4 | **Typography not responsive** | Theme in `main.jsx` — all headings fixed (`h1: 2rem` = 32px always) | h1 dominates viewport on 320px phones |

### Medium

| # | Issue | Where | Impact |
|---|-------|-------|--------|
| 5 | **Home logo fixed 300px** | `Home.jsx` — `width={"300px"}` | Overflows on phones narrower than 320px |
| 6 | **Phone fields side-by-side** | `Signup.jsx` — code (45%) + number (55%) | Cramped on narrow screens |
| 7 | **Missing inputMode on fields** | Email, phone, and number fields across all forms | Wrong mobile keyboard appears |
| 8 | **CornerChip media query inverted** | `CornerChip.jsx` — checks `'(width > 960px)'` | Desktop-first logic; sizing is wrong on mobile |
| 9 | **Message board fixed 300px height** | `EventMessageBoard.jsx` | Takes 1/3 of viewport on small phones — cramped |
| 10 | **GoBack component uses `<hr>` decorations** | `GoBack.jsx` | Awkward spacing; should be a clean back arrow + label |

### Accessibility

| # | Issue | Where | Impact |
|---|-------|-------|--------|
| 11 | **Icon buttons missing aria-labels** | EventCard edit, Message delete, all collapse triggers | Screen readers can't identify button purpose |
| 12 | **Auth links not touch-friendly** | Login, Signup — plain `<Link>` with only margin | No minimum touch height; should be `Button variant="text"` |

### What's Already Good

- Viewport meta tag correct
- Container `maxWidth="sm"` sensible for mobile
- Native HTML5 date/time pickers (great for mobile)
- Collapsible sections on EventDetails (good progressive disclosure)
- `EventLeaveButton` uses `scrollIntoView({ behavior: "smooth" })`
- Socket.io reconnect on visibility change (good PWA pattern)
- Service Worker registered properly

## Recommended Changes

Changes are listed in implementation order. Each change is independent and can be reviewed separately.

### Change 1: Replace hamburger drawer with BottomNavigation

**What:** Add a fixed BottomNavigation bar at the bottom of the screen for primary destinations. Keep the drawer only for overflow items (Glossary, Logout).

**Navigation items by role:**
- **Anonymous:** Inicio, Acceso, Registro
- **User:** Inicio, Eventos, Perfil, Mas (overflow menu)
- **Organizer/Admin:** Inicio, Eventos, Usuarios, Perfil, Mas

**Why:** BottomNavigation is the standard mobile pattern for 3-5 primary destinations. It's always visible, thumb-reachable, and recommended by Material Design for mobile apps. The hamburger drawer hides navigation behind an extra tap — acceptable for desktop, but not for a phone-first PWA.

**Trade-off:** Loses ~56px of vertical screen space to the fixed bar. Acceptable because the always-visible nav eliminates the disorientation of hidden navigation.

### Change 2: Add FAB for "Crear Evento" (organizer/admin)

**What:** A Floating Action Button on the Event List and Home screens for organizer/admin users.

**Why:** Creating an event is the primary organizer action. A FAB makes it immediately accessible without navigating to a menu. Follows Material Design guidance for primary screen actions.

### Change 3: Fix all touch targets to 48px minimum

**What:** Audit and fix every interactive element to meet the 48dp Material Design minimum:
- `Message.jsx` delete button: remove `size='small'`
- `Glossary.jsx` ToggleButtons: remove `size='small'`
- `Glossary.jsx` category Chips: remove `size='small'`
- `UserSearch.jsx` input: increase height to 48px
- All password visibility toggles: set explicit 48px
- All collapse/expand IconButtons: set explicit 48px

**Why:** 48dp is the Material Design minimum for touch targets. Undersized targets cause mis-taps and frustration, especially for one-handed phone use.

### Change 4: Make typography responsive

**What:** Update the theme to use breakpoint-based font sizes:
```
h1: { xs: '1.5rem', sm: '2rem' }
h2: { xs: '1.4rem', sm: '1.8rem' }
h3: { xs: '1.3rem', sm: '1.6rem' }
h4: { xs: '1.2rem', sm: '1.4rem' }
```

**Why:** Fixed 32px headings dominate the viewport on 320px phones. Responsive typography adapts to the available space.

### Change 5: Fix button layouts to be responsive

**What:** Replace percentage-width button rows with MUI Stack components that wrap on mobile:
- `EventEdit.jsx`: 4 management buttons → Stack with `flexWrap` and responsive sizing
- `EventManage.jsx`: 3 tab buttons → same pattern
- `EventCarGroupInfoCard.jsx`: 2 action buttons → full-width stacked on mobile

**Why:** Fixed percentage widths assume a minimum screen width and create cramped or broken layouts on narrow phones.

### Change 6: Add inputMode to form fields

**What:** Add appropriate `inputMode` props:
- Email fields: `inputMode="email"` (triggers @ keyboard)
- Phone fields: `inputMode="tel"` (triggers numeric keypad)
- Number fields: `inputMode="numeric"` (triggers number keyboard)

**Why:** The correct mobile keyboard reduces friction and errors when filling forms.

### Change 7: Fix Home logo scaling

**What:** Change `width={"300px"}` to `style={{ maxWidth: '100%', width: 300 }}`.

**Why:** Prevents horizontal overflow on phones narrower than 320px.

### Change 8: Add aria-labels to icon buttons

**What:** Add `aria-label` to all icon-only buttons (edit, delete, expand/collapse, send message). Add `aria-expanded` to collapse triggers.

**Why:** Screen reader accessibility. Also benefits mobile users who use assistive technology.

### Change 9: Stack phone fields on mobile

**What:** In `Signup.jsx`, use MUI Stack with `direction={{ xs: 'column', sm: 'row' }}` for the country code + phone number fields.

**Why:** Side-by-side at 45%/55% is cramped on narrow screens. Stacking vertically gives each field full width on mobile.

### Change 10: Fix remaining medium issues

- **CornerChip media query**: invert to mobile-first (`max-width` instead of `min-width`)
- **EventMessageBoard height**: responsive `maxHeight: { xs: 200, sm: 300 }`
- **GoBack component**: simplify to clean back arrow + label, remove `<hr>` decorations
- **Auth page links**: convert to `Button variant="text"` for proper touch targets

## Files Expected to Change

| File | Changes |
|------|---------|
| `client/src/components/navigation/Navbar.jsx` | Major rewrite — add BottomNavigation, keep drawer for overflow |
| `client/src/main.jsx` | Responsive typography in theme |
| `client/src/App.jsx` | Layout adjustments for bottom nav padding |
| `client/src/pages/event/EventEdit.jsx` | Responsive button layout |
| `client/src/pages/event/EventManage.jsx` | Responsive button layout |
| `client/src/components/event/EventCarGroupInfoCard.jsx` | Responsive button layout |
| `client/src/components/messages/Message.jsx` | Touch target fix, aria-label |
| `client/src/components/messages/EventMessageBoard.jsx` | Responsive height |
| `client/src/pages/Glossary.jsx` | Touch target fixes |
| `client/src/components/user/UserSearch.jsx` | Touch target fix |
| `client/src/pages/auth/Login.jsx` | inputMode, link → button |
| `client/src/pages/auth/Signup.jsx` | inputMode, phone field layout |
| `client/src/pages/auth/PasswordForget.jsx` | inputMode |
| `client/src/pages/auth/PasswordReset.jsx` | inputMode |
| `client/src/pages/event/EventCreate.jsx` | inputMode |
| `client/src/components/car-group/CarGroupEditForm.jsx` | inputMode |
| `client/src/pages/car-group/CarGroupCreate.jsx` | inputMode |
| `client/src/pages/Home.jsx` | Logo responsive scaling |
| `client/src/components/ui/CornerChip.jsx` | Fix media query |
| `client/src/components/navigation/GoBack.jsx` | Simplify layout |
| `client/src/components/event/EventCard.jsx` | aria-label on edit button |
| `client/src/components/event/EventDescription.jsx` | aria-expanded |
| `client/src/components/event/EventParticipantsCollapse.jsx` | aria-expanded |
| `client/src/components/car-group/CarGroupCollapse.jsx` | aria-expanded |

## Visual & UX Suggestions

Beyond the specific fixes above, the overall mobile feel could improve significantly with a set of theme-level and component-level changes. These don't fix bugs — they elevate the perceived quality of the UI.

### Suggestion 1: Strengthen the typographic hierarchy

The current theme defines heading sizes but uses standard MUI font weights. On mobile, headings and body text blend together because nothing stands out with authority. Using heavier font weights (700 for headings, 600 for subtitles) and tighter letter-spacing (-0.5px on h1, -0.3px on h2) creates an immediate visual hierarchy — users can scan a screen and instantly distinguish titles from content.

### Suggestion 2: Use spacing deliberately

Many screens pack elements close together with uniform MUI default spacing. Introducing intentional rhythm — larger gaps between sections, tighter gaps within related items — makes each screen feel structured rather than crowded. For example, collapsible sections should have generous padding (48px tap targets help here too), and there should be clear breathing room between the event card, the join/leave action, and the expandable sections.

### Suggestion 3: Use card styles to communicate purpose

Currently, almost everything is wrapped in elevated `Card` components with shadows. When every element has the same card treatment, nothing stands out. Using different card styles for different purposes — flat backgrounds (`bgcolor: '#F5F5F2'`) for informational blocks, subtle outlined cards for interactive items, dashed borders for empty states ("no tienes coche asignado") — gives users visual cues about what each block is for, without adding clutter.

### Suggestion 4: Add category color indicators to event cards

A thin colored left border (4px) on each event card, colored by category (one color for protectora, another for mercadillo, etc.), gives instant visual differentiation between event types. This is more effective than the current approach of relying solely on text chips, which compete for attention with other chips on the card. The color bar is subtle but immediately scannable when scrolling through a list.

### Suggestion 5: Increase border radius globally

The current app uses MUI's default border radius (4px), which feels utilitarian. Increasing to 12px globally (16px for cards, 10px for buttons and inputs, 20px for chips) immediately makes the interface feel more modern and more touchable. This is a single theme-level change with broad impact.

### Suggestion 6: Display messages as chat bubbles

The current message board uses a flat list with sender names and text on separate lines. Adopting a chat bubble pattern — the user's own messages aligned right in a colored bubble, others' messages aligned left in a neutral bubble — is an instantly familiar mobile pattern. Users already know how this works from every messaging app. It transforms the message board from "reading a list" to "having a conversation."

### Suggestion 7: Reduce visual noise

Some screens have dense rows of chips that compete for attention. Using badge counts sparingly (e.g., a small count next to "Participantes" instead of a full chip row) and simplifying status indicators to a single well-placed chip per card will make each element more impactful by reducing the total number of competing visual elements.

## Open Questions for Maintainer

1. **BottomNavigation items for organizer/admin**: Should "Usuarios" be in the bottom nav or under "Mas"? With 5 items the bar gets tight — 4 items + "Mas" might be better.
2. **FAB on Home screen**: Should the "Crear Evento" FAB appear on the Home screen too, or only on the Event List?
3. **GoBack redesign**: The current `<hr>`-flanked back button is distinctive. Is this intentional branding, or was it a quick implementation? We could use a simpler arrow + label pattern.
4. **Logout placement**: Currently in the drawer. It could be added to the "Mas" overflow menu. Any preference?
