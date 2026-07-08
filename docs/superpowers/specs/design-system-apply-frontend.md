---
diaboli: pending
cartographer: pending
issue: 34
---

# Apply the mobile-first design system to the client (frontend)

## User Story

As a volunteer using the Patas Arriba PWA on my phone, I want the app to look
and feel like the foundation's brand and follow mobile-first patterns —
reachable navigation, touch-sized targets, the right keyboard for each field —
so that participating in events from a phone is comfortable instead of a
shrunken desktop experience.

## Why this matters

Issue #14 produced the audit, the brand-accurate token theme, and a browsable
design-system reference, but the client still ships the old hand-typed theme
(amber-primary `#EFB665`, invented navy text, `App.css !important` overrides)
and the desktop-first patterns the audit flagged. This spec covers landing
that work in `client/` (issue #34).

## Sources of truth

- Theme + tokens: `docs/mockup/v6-mui-light.html`, `docs/design-tokens-issue-14.md`
- Audit + the 10 changes: `docs/design-choices-issue-14-mobile-first.md`

Where the audit and the v6 theme disagree (e.g. Change 4's breakpoint font
sizes vs v6's `clamp()` headings), **v6 wins** — it postdates and supersedes
the audit's sketches.

## Functional Requirements

### Step 1 — Theme port (foundational)

- **FR-1 [visual]** `client/src/main.jsx` builds its theme from the v6 named
  tokens: coral `#EA5347` primary / amber `#EFB666` secondary (with the
  documented contrastText decisions), functional error/warning/success/info,
  named `surface.*`, `brand.*`, unified `palette.category` map,
  `palette.avatar` ring, warm text near-black `#2E2E2E` (navy `#173A5E` is
  deleted), `shape.borderRadius: 12` + `radii` scale, warm shadows, and the
  v6 `theme.components` overrides (Button ≥48px, IconButton ≥44px, Card,
  Chip, TextField, Accordion, Fab, BottomNavigationAction).
- **FR-2 [visual]** Display typography: h1/h2 use Staatliches via
  `@fontsource/staatliches` with v6's `clamp()` sizes; h3–h6 stay Roboto at
  v6 sizes; body/subtitle/caption revert to MUI defaults (16px inputs avoid
  iOS focus zoom). The old global rem-inflation media queries in `App.css`
  (`html { font-size: 19/22/25/28px }`) are removed — they are the
  desktop-first mechanism the old fixed heading sizes relied on.
- **FR-3 [visual]** The `App.css` `!important` block (Alert/Button/Chip font
  overrides) is deleted; surviving rules (`#root`, `.remove-margin`, `hr`,
  `a:visited`) lose hardcoded amber in favour of the new palette.
  `CssBaseline` is added so `background.default` (`#FAFAF8`) actually paints
  the canvas (replaces the `#F5F5F5` hardcoded in `index.css`).
- **FR-4 [visual]** `avatarColorFor(seed)` and the `palette.avatar` ring land
  as an exported utility + token. **Non-goal:** replacing the user-chosen
  `iconColor`/icon feature (`UpdateUserIcon.jsx`, stored server-side). The
  helper is available as fallback/for new surfaces; ripping out user-chosen
  colors is a product + server-model change that needs the maintainer.
- **FR-5 [visual]** `Glossary.jsx` chips read from `palette.category` (slugs
  `plataforma`/`rol`/`evento`/`refugio`) instead of overloading semantic
  colors — the "two category systems" mistake the tokens doc fixes.

### Step 2 — Audit changes

- **FR-6 [TDD]** (Change 1) `BottomNavigation` replaces the hamburger drawer
  as primary navigation:
  - Anonymous: Inicio, Acceso, Registro
  - Logged-in (all roles): Inicio, Eventos, Perfil, Más
  - "Más" opens an overflow (drawer/menu) holding Glosario, Cerrar Sesión,
    and — for organizer/admin — Ver Usuarios and Crear Evento.
  - The bar marks the active destination and navigates on tap; content gets
    bottom padding so nothing hides behind the fixed bar.
- **FR-7 [TDD]** (Change 2) A "Crear Evento" FAB renders on the Event List
  for organizer/admin users only; volunteers and anonymous users never see it.
- **FR-8 [TDD]** (Change 6) Email fields set `inputMode="email"`, phone
  fields `inputMode="tel"`, numeric fields `inputMode="numeric"` (Login,
  Signup, PasswordForget/Reset, EventCreate, CarGroup forms).
- **FR-9 [TDD]** (Change 8) Every icon-only button has an `aria-label`
  (edit, delete, expand/collapse, send, password visibility); collapse
  triggers expose `aria-expanded`.
- **FR-10 [visual]** (Change 3) All touch targets ≥48px: Message delete,
  Glossary toggles + chips, UserSearch input, password toggles, collapse
  IconButtons (much of this falls out of the FR-1 component overrides).
- **FR-11 [visual]** (Change 4) Responsive headings via the v6 theme (FR-2
  delivers this; no per-page work beyond removing local font-size hacks).
- **FR-12 [visual]** (Change 5) Percentage-width button rows in
  `EventEdit.jsx`, `EventManage.jsx`, `EventCarGroupInfoCard.jsx` become
  wrapping/stacking `Stack` layouts.
- **FR-13 [visual]** (Change 7) Home logo scales: `maxWidth: '100%'`.
- **FR-14 [visual]** (Change 9) Signup phone fields stack on xs.
- **FR-15 [visual]** (Change 10) CornerChip media query inverted to
  mobile-first; EventMessageBoard height responsive
  (`maxHeight: { xs: 200, sm: 300 }`); GoBack simplified to arrow + label
  (no `<hr>`); auth page links become `Button variant="text"`.

## Acceptance scenarios (the TDD'd FRs)

- **Given** an anonymous visitor, **when** the app shell renders, **then**
  the bottom nav shows exactly Inicio / Acceso / Registro and tapping
  Acceso navigates to `/login`.
- **Given** a logged-in volunteer, **then** the bottom nav shows Inicio /
  Eventos / Perfil / Más; **when** Más is opened **then** Glosario and
  Cerrar Sesión are present and Ver Usuarios / Crear Evento are absent.
- **Given** a logged-in organizer or admin, **when** Más is opened, **then**
  Ver Usuarios and Crear Evento are present.
- **Given** a logged-in organizer on the Event List, **then** a FAB with
  accessible name "Crear evento" is present and navigates to
  `/event/create`; **given** a volunteer, **then** no such FAB renders.
- **Given** the Signup form, **then** the email input has
  `inputMode="email"` and the phone number input `inputMode="tel"`.
- **Given** any icon-only button (e.g. message delete), **then** it has a
  non-empty accessible name.

## Test discipline (user-approved 2026-07-08)

Hybrid: strict red-green TDD only for the behavior-bearing FRs (FR-6..FR-9)
via Vitest + React Testing Library (first component tests in the client —
includes harness setup). Pure styling FRs are verified visually against the
v6 mockup and by the root Playwright suite as the regression net; token
values are not asserted in unit tests (tautological).

## Decisions proposed here (flag to maintainer, not yet confirmed)

1. **Nav items (audit Q1):** organizer/admin get the same 4-item bar as
   volunteers; Ver Usuarios lives under Más. Rationale: 5 items is tight on
   narrow phones, the FAB already covers the primary organizer action, and a
   consistent bar across roles is simpler.
2. **FAB placement (audit Q2):** Event List only, not Home.
3. **GoBack (audit Q3):** clean back arrow + label, `<hr>` decorations
   removed.
4. **Logout (audit Q4):** in the Más overflow.
5. **Avatar colors:** user-chosen `iconColor` survives (see FR-4 non-goal).

## Out of scope

- Server changes of any kind.
- The audit's "Visual & UX Suggestions" 1–7, except what the theme itself
  delivers (radius scale, shadows, typographic hierarchy).
- Instrument Serif (deliberately excluded by the tokens doc).
- Dark mode.
