---
diaboli: docs/superpowers/objections/design-system-apply-frontend.md (10/10 disposed)
cartographer: docs/superpowers/stories/design-system-apply-frontend.md (7/7 disposed)
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

- **FR-1 [visual]** The theme lives in a dedicated side-effect-free module
  `client/src/theme.js`, consumed by `main.jsx` (the entry point keeps only
  mounting + service-worker concerns, so components and tests can import
  tokens without executing it — O1). It builds from the v6 named tokens:
  coral `#EA5347` primary / amber `#EFB666` secondary (with the documented
  contrastText decisions), functional error/warning/success/info, named
  `surface.*`, `brand.*`, unified `palette.category` map, `palette.avatar`
  ring, warm text near-black `#2E2E2E` (navy `#173A5E` is deleted),
  `shape.borderRadius: 12` + `radii` scale, warm shadows, and the v6
  `theme.components` overrides (Button ≥48px, IconButton ≥44px, Card, Chip,
  TextField, Accordion, Fab, BottomNavigationAction).
  **Contrast rule (O6):** contained primary buttons stay coral everywhere —
  the 3.6:1 white-on-coral tradeoff is accepted app-wide (it is what the
  foundation's own site does); `primary.dark` is reserved for future
  strict-AA contexts, not applied ad hoc per component.
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
  **Deliberately consumer-less (O5):** the ring ships without call sites on
  purpose — it is part of the documented token system (tokens doc §avatar)
  and the chat-bubble redesign (audit Suggestion 6) is its intended first
  consumer; landing it with the rest of the tokens keeps the theme a
  faithful port rather than a subset.
- **FR-5 [visual]** `Glossary.jsx` chips read from `palette.category` (slugs
  `plataforma`/`rol`/`evento`/`refugio`) instead of overloading semantic
  colors — the "two category systems" mistake the tokens doc fixes.

### Step 2 — Audit changes

- **FR-6 [TDD]** (Change 1, revised 2026-07-09 in-session) `BottomNavigation`
  replaces the hamburger drawer as primary navigation:
  - Anonymous: **no bar at all, and the landing IS the login screen**
    (the v6 "welcome + login in one screen" direction): wordmark, the
    login form inline, a forgot-password link and exactly one Regístrate
    path to /signup. /login redirects to / for old links; signup and
    password flows rely on the top-bar back arrow. (Resolved 2026-07-09
    from choice-story S4 / issue #36, superseding first the
    Inicio/Acceso/Registro bar and then the separate CTA landing.)
  - Logged-in (all roles): **Eventos, Glosario, Perfil, Más** — there is no
    Inicio tab: Home and Eventos were near-duplicates, so `/` redirects
    logged-in users to `/event` (Home stays as the anonymous landing) and
    Glosario is promoted from the Más sheet into the bar.
  - "Más" holds Cerrar Sesión, and — for organizer/admin — Ver Usuarios.
    Crear Evento lives only on the events-list FAB (FR-7); the profile
    page also carries a Cerrar Sesión button at its foot.
  - The bar marks the active destination and navigates on tap; content gets
    bottom padding so nothing hides behind the fixed bar.
  - The bar itself pads with `env(safe-area-inset-bottom)` and the viewport
    meta sets `viewport-fit=cover`, so an installed iOS PWA doesn't sink the
    bar under the home indicator (O7).
  - **Title-only top bar (O4, revised by choice-story S5).** A standard
    sticky MUI AppBar shows the current screen's title in the brand
    display face — and nothing else: no username, role badge, avatar or
    overflow menu in persistent chrome. Identity and role live on the
    Perfil screen; navigation lives in the BottomNav. (S5 superseded the
    O4-era per-screen `PageHeader` greeting header.)
  - **Back navigation lives in the top bar (2026-07-09).** Screens that
    are not bar destinations (event details/edit/manage/create,
    car-group pages, other users' profiles, password flows, error pages)
    get a back arrow on the AppBar's left; bar destinations (Eventos,
    Glosario, Perfil, Usuarios, anonymous Home/Acceso/Registro) never
    show one. The in-page `GoBack` component is deleted, and page titles
    that merely duplicate the AppBar title are removed.
- **FR-7 [TDD]** (Change 2) A "Crear Evento" FAB renders on the Event List
  for organizer/admin users only; volunteers and anonymous users never see it.
- **FR-8 [TDD]** (Change 6) Email fields set `inputMode="email"`, phone
  fields `inputMode="tel"`, numeric fields `inputMode="numeric"` (Login,
  Signup, PasswordForget/Reset, EventCreate, CarGroup forms).
- **FR-9 [TDD]** (Change 8) These icon-only buttons have an `aria-label`
  (the audit's enumeration, replacing an unfalsifiable "every" — O8):
  EventCard edit, Message options menu, the three disclosure toggles
  (EventDescription, EventParticipantsCollapse, CarGroupCollapse), and the
  password-visibility toggles (already labeled). The three disclosure
  toggles also expose `aria-expanded`.
- **FR-10 [visual]** (Change 3) Touch-target floors (O2 resolved 2026-07-08):
  **48px for buttons and inputs, 44px for icon-only buttons** — the v6
  IconButton override deliberately follows the Apple HIG 44pt minimum
  because 48px icon buttons crowd dense rows (message list, card headers).
  Applies to: Message options, Glossary filter chips, UserSearch input,
  password toggles, collapse IconButtons (mostly via the FR-1 overrides).
- **FR-11 [visual]** (Change 4) Responsive headings via the v6 theme (FR-2
  delivers this; no per-page work beyond removing local font-size hacks).
- **FR-12 [visual]** (Change 5) Percentage-width button rows in
  `EventEdit.jsx`, `EventManage.jsx`, `EventCarGroupInfoCard.jsx` become
  wrapping/stacking `Stack` layouts.
- **FR-13 [visual]** (Change 7) Home logo scales: `maxWidth: '100%'`.
- **FR-14 [visual]** (Change 9) Signup phone fields stack on xs.
- **FR-15 [visual]** (Change 10) CornerChip media query inverted to
  mobile-first; EventMessageBoard height responsive
  (`maxHeight: { xs: 200, sm: 300 }`); GoBack first simplified to arrow +
  label, then deleted outright when back moved into the top bar (see
  FR-6); auth page links become `Button variant="text"`.
- **FR-16 [visual]** (2026-07-09) Visual hierarchy on the events screen:
  informational chips must not wear the CTA coral — timeframe/status
  chips use functional or neutral colors (per the AGENTS.md
  brand-for-identity/ergonomics-for-function rule, coral is reserved for
  primary actions), and the Próximos/Pasados timeframe filter renders as
  a single exclusive toggle, not two separate buttons. Tappable event
  cards carry a right-edge chevron as the disclosure affordance, and
  list↔details navigation animates via the View Transitions API (the
  card morphs into the details card; no-op on unsupporting browsers,
  disabled under prefers-reduced-motion).

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
via Vitest + React Testing Library, reusing the component-test harness the
client has had since 2026-05-03 (an earlier draft wrongly claimed these were
the client's first component tests — corrected per O10). Pure styling FRs
are verified visually against the v6 mockup and by the root Playwright
suite; per O3 that suite gains a **mobile-viewport project** (iPhone-class
emulation in `playwright.config.js`) so every e2e spec also runs at phone
size — a desktop-only run cannot see xs-breakpoint regressions. Token
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
