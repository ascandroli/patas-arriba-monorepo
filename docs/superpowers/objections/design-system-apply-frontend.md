---
spec: docs/superpowers/specs/design-system-apply-frontend.md
date: 2026-07-08
mode: spec
diaboli_model: claude-fable-5
objections:
  - id: O1
    category: specification quality
    severity: high
    claim: "FR-1 pins the theme to client/src/main.jsx, but main.jsx is a side-effecting entry module, which contradicts the spec's own requirement for an exported utility (FR-4) and for Vitest component tests that need theme access."
    evidence: "FR-1: 'client/src/main.jsx builds its theme from the v6 named tokens'; FR-4: '`avatarColorFor(seed)` and the `palette.avatar` ring land as an exported utility + token'; test discipline: 'via Vitest + React Testing Library'. main.jsx registers the service worker and calls ReactDOM.createRoot at module scope."
    disposition: accepted
    disposition_rationale: "Valid: the entry module cannot export tokens without side effects. Spec FR-1 amended to name src/theme.js; the implementation already built it that way. Disposed by ascandroli 2026-07-08."
  - id: O2
    category: specification quality
    severity: high
    claim: "FR-1's v6 component override sets IconButton to a 44px minimum while FR-10 mandates all touch targets ≥48px and claims FR-1 delivers much of it — an internal contradiction that guarantees divergent implementations."
    evidence: "FR-1: 'the v6 `theme.components` overrides (Button ≥48px, IconButton ≥44px, …)'; FR-10: 'All touch targets ≥48px: … password toggles, collapse IconButtons (much of this falls out of the FR-1 component overrides)'; audit Change 3: 'All collapse/expand IconButtons: set explicit 48px'."
    disposition: accepted
    disposition_rationale: "Real contradiction. Resolution: 48px floor for buttons/inputs, 44px floor for icon-only buttons (Apple HIG; 48px icon buttons crowd dense rows). FR-10 amended; shipped theme already complies. Disposed by ascandroli 2026-07-08."
  - id: O3
    category: risk
    severity: high
    claim: "The spec's named regression net for the ten [visual] FRs — the root Playwright suite — runs a single desktop-viewport chromium project over three spec files that cover almost none of the surfaces those FRs change, so the class of mobile-layout regressions this spec exists to fix is undetectable by it."
    evidence: "Spec: 'Pure styling FRs are verified visually against the v6 mockup and by the root Playwright suite as the regression net'; playwright.config.js defines only `{ name: 'chromium' }` with no viewport/device emulation; e2e/ contains only smoke.spec.js, auth.spec.js, happy-path.spec.js — no coverage of Glossary, EventMessageBoard, EventEdit/EventManage button rows, or CornerChip."
    disposition: accepted
    disposition_rationale: "The desktop-only net was structurally blind to the regressions this spec targets. A mobile-viewport (iPhone 13 emulation) Playwright project was added to playwright.config.js so every e2e spec also runs at phone size; spec's test-discipline section amended. Disposed by ascandroli 2026-07-08."
  - id: O4
    category: specification quality
    severity: medium
    claim: "FR-6 says BottomNavigation replaces the hamburger drawer but never specifies what happens to the top of the screen — the logged-in identity display, role badge, and profile shortcut the old Navbar carried are unaddressed, so implementations can reasonably diverge between deleting and keeping them."
    evidence: "FR-6: '`BottomNavigation` replaces the hamburger drawer as primary navigation' — the spec's only statements about the remaining chrome are the Más overflow contents and 'content gets bottom padding'; no FR mentions the AppBar/Navbar remnant, username display, or admin/organizer indicator."
    disposition: accepted
    disposition_rationale: "Agreed after live review: the interim global identity strip was an implementation invention. Resolution follows the v6 mockup — no global top bar; screens own their headers (PageHeader: greeting + display title + avatar profile shortcut, first on the events list); role information lives on the Perfil screen. FR-6 amended; Navbar deleted. Disposed by ascandroli 2026-07-08."
  - id: O5
    category: scope
    severity: medium
    claim: "FR-4 ships avatarColorFor and the palette.avatar ring with zero call sites: the only existing avatar consumer (user-chosen iconColor) is declared a non-goal, and the v6 surfaces that actually use the helper (chat-bubble sender colors) are excluded by the out-of-scope list — speculative API landed 'for new surfaces'."
    evidence: "FR-4: 'The helper is available as fallback/for new surfaces'; FR-4 non-goal: 'replacing the user-chosen `iconColor`/icon feature'; Out of scope: 'The audit's \"Visual & UX Suggestions\" 1–7' (chat bubbles are Suggestion 6, the mockup's main avatarColorFor consumer)."
    disposition: rejected
    disposition_rationale: "Deliberate design-system parity, not speculation: the ring is part of the documented token system (tokens doc §avatar) and the chat-bubble redesign (audit Suggestion 6) is its intended first consumer. Spec FR-4 amended to record the consumer-less landing as intentional. Disposed by ascandroli 2026-07-08."
  - id: O6
    category: specification quality
    severity: medium
    claim: "FR-1 imports 'the documented contrastText decisions' including the coral 3.6:1 tradeoff with a primary.dark escape hatch, but neither the spec nor the tokens doc gives a criterion for which app buttons 'must carry body-size label text to strict AA', so implementers will diverge between all-coral fills and selectively darkened CTAs."
    evidence: "FR-1: 'coral `#EA5347` primary … (with the documented contrastText decisions)'; docs/design-tokens-issue-14.md: 'Where a contained primary button must carry body-size (16px) label text to strict AA, use `primary.dark`' — no rule anywhere for when a button 'must'."
    disposition: accepted
    disposition_rationale: "Criterion now documented in FR-1: contained primary buttons stay coral app-wide (matches the foundation's own site); the 3.6:1 tradeoff is accepted globally and primary.dark is reserved for future strict-AA contexts. No code change. Disposed by ascandroli 2026-07-08."
  - id: O7
    category: implementation
    severity: medium
    claim: "A fixed BottomNavigation in an installed iOS PWA overlaps the home-indicator area unless the bar itself gets safe-area-inset padding; the spec addresses content clearance but not the bar, and the v6 mockup it defers to contains no safe-area handling at all."
    evidence: "FR-6: 'content gets bottom padding so nothing hides behind the fixed bar' — nothing about the bar's own inset; grep of docs/mockup/v6-mui-light.html for `safe-area`/`env(` returns no matches; the user story targets 'a volunteer using the Patas Arriba PWA on my phone'."
    disposition: accepted
    disposition_rationale: "Valid gap. FR-6 amended with the safe-area clause; the shipped bar already pads with env(safe-area-inset-bottom), and viewport-fit=cover was added to client/index.html to make the inset available in installed iOS PWAs. Disposed by ascandroli 2026-07-08."
  - id: O8
    category: specification quality
    severity: medium
    claim: "FR-9 requires 'every icon-only button' to have an aria-label but the acceptance scenario is a single example, and the spec provides neither an enumeration nor an enforcement mechanism, so 'every' is unfalsifiable as written."
    evidence: "FR-9: 'Every icon-only button has an `aria-label` (edit, delete, expand/collapse, send, password visibility)'; acceptance: 'Given any icon-only button (e.g. message delete), then it has a non-empty accessible name' — one exemplar cannot verify a universal claim."
    disposition: accepted
    disposition_rationale: "The universal was unfalsifiable. FR-9 amended to enumerate the audit's concrete button list (EventCard edit, Message options, three disclosure toggles, password toggles); shipped labels cover that list. jsx-a11y lint enforcement deferred until the client's broken baseline lint is cleaned up. Disposed by ascandroli 2026-07-08."
  - id: O9
    category: scope
    severity: low
    claim: "client/CLAUDE.md documents the exact facts this spec deletes (amber primary #EFB665, theme defined in main.jsx) and the spec does not include updating it, so the client's own agent guidance is false on the day the change ships."
    evidence: "client/CLAUDE.md: 'Custom Material-UI theme with color palette defined in main.jsx — Foundation branding colors (primary: #EFB665)'; spec FR-1 makes coral primary and the 'Why this matters' section calls #EFB665 'the old hand-typed theme'; no FR or scope note touches client/CLAUDE.md."
    disposition: accepted
    disposition_rationale: "client/CLAUDE.md's Theming section updated in the same client branch: theme in src/theme.js, coral #EA5347 primary, pointer to the tokens doc. Disposed by ascandroli 2026-07-08."
  - id: O10
    category: alternatives
    severity: low
    claim: "The spec introduces a brand-new component-test harness for exactly four FRs without weighing the materially cheaper alternative of TDD-ing FR-6..FR-9 in the already-running Playwright suite, whose seeded role-based logins map directly onto the spec's Given/When/Then scenarios."
    evidence: "Test discipline: 'strict red-green TDD only for the behavior-bearing FRs (FR-6..FR-9) via Vitest + React Testing Library (first component tests in the client — includes harness setup)'; e2e/happy-path.spec.js already exercises organizer login and 'Crear Evento'; the spec records no consideration of the e2e route."
    disposition: rejected
    disposition_rationale: "False premise: the Vitest+RTL harness pre-existed (landed upstream 2026-05-03 with 17 tests) and was reused, so no harness-setup cost was paid for these FRs. The spec's erroneous 'first component tests' claim is corrected in the same edit. Disposed by ascandroli 2026-07-08."
---

# Objections — Apply the mobile-first design system to the client (spec mode)

## O1 — specification quality — high

### Claim

FR-1 states that `client/src/main.jsx` builds the theme, but the spec's own
requirements make that location untenable, and it never names an alternative.
FR-4 requires `avatarColorFor(seed)` and the `palette.avatar` ring to "land as
an exported utility + token", and the test-discipline section requires Vitest +
React Testing Library component tests. `main.jsx` is the application entry
module: it registers the service worker and calls `ReactDOM.createRoot` at
module scope. Anything — a component, a test, the FR-4 utility's consumers —
that imports tokens from `main.jsx` executes those side effects. Two reasonable
implementers will diverge: one follows FR-1 literally (theme inline in
`main.jsx`, utility exported from an entry module that mounts the app), the
other extracts a side-effect-free theme module and thereby violates FR-1's
letter.

### Evidence

> **FR-1 [visual]** `client/src/main.jsx` builds its theme from the v6 named
> tokens

> **FR-4 [visual]** `avatarColorFor(seed)` and the `palette.avatar` ring land
> as an exported utility + token.

> Hybrid: strict red-green TDD only for the behavior-bearing FRs (FR-6..FR-9)
> via Vitest + React Testing Library

`client/src/main.jsx` contains top-level `navigator.serviceWorker.register(...)`
and `ReactDOM.createRoot(document.getElementById('root')).render(...)` — both
execute on import.

### Why this matters

The FR that anchors the whole Step-1 port names a location that cannot satisfy
the spec's export and testing requirements. Left unresolved, either the tests
the spec mandates become impossible to write cleanly, or the implementation
silently departs from FR-1 and the code-time adversarial pass flags a
spec/implementation divergence that was knowable now. The fix is one sentence:
name the theme module (e.g. `client/src/theme.js`) and let `main.jsx` consume it.

## O2 — specification quality — high

### Claim

The spec contradicts itself on the touch-target floor. FR-1 adopts the v6
overrides verbatim, which set IconButton to **≥44px**. FR-10 mandates **all**
touch targets ≥48px — explicitly including password visibility toggles and
collapse IconButtons — and asserts that "much of this falls out of the FR-1
component overrides". It does not: a 44px IconButton satisfies FR-1 and fails
FR-10. The spec's own conflict rule ("v6 wins") makes this worse, because
applied literally it resolves the contradiction to 44px, directly against
FR-10's headline requirement and the audit's Change 3 ("set explicit 48px").

### Evidence

> **FR-1** … the v6 `theme.components` overrides (Button ≥48px, IconButton
> ≥44px, …)

> **FR-10 [visual]** (Change 3) All touch targets ≥48px: … password toggles,
> collapse IconButtons (much of this falls out of the FR-1 component overrides).

`docs/design-choices-issue-14-mobile-first.md`, Change 3: "All password
visibility toggles: set explicit 48px. All collapse/expand IconButtons: set
explicit 48px."

> Where the audit and the v6 theme disagree … **v6 wins**

### Why this matters

Touch-target size is one of the audit's two *critical* mobile findings. An
implementer can ship IconButtons at 44px in full compliance with FR-1 and the
v6-wins rule while violating FR-10, and a reviewer applying FR-10 will bounce
the same work. The spec must state which floor governs IconButtons (44 or 48)
and correct either FR-1's override description or FR-10's universal claim.

## O3 — risk — high

### Claim

Ten of the fifteen FRs are tagged [visual] and rely on "visual verification
against the v6 mockup and the root Playwright suite as the regression net."
That net cannot catch the failure class this spec is about. The suite is three
spec files (smoke, auth, happy-path) running one chromium project at
Playwright's default desktop viewport — there is no mobile device or viewport
project in `playwright.config.js`. Regressions in xs breakpoints, `clamp()`
minimums, stacked `Stack` layouts, the inverted CornerChip media query, or the
responsive message-board height are definitionally invisible at 1280×720. And
most surfaces FR-10..FR-15 touch (Glossary, EventMessageBoard, EventEdit /
EventManage / EventCarGroupInfoCard button rows, CornerChip, GoBack) appear in
no e2e test at all.

### Evidence

> Pure styling FRs are verified visually against the v6 mockup and by the root
> Playwright suite as the regression net

`playwright.config.js` projects: only `{ name: "chromium", use: { browserType:
"chromium" } }` — no `viewport` or device preset. `e2e/` contains
`smoke.spec.js`, `auth.spec.js`, `happy-path.spec.js`; grep shows no selector
touching Glossary, messages, or the event-management button rows.

### Why this matters

The spec presents a two-layer verification story, but the second layer is
structurally unable to detect mobile-layout regressions, so in practice the
only guard for two-thirds of the FRs is a one-time manual eyeball. Either the
spec should add a mobile-viewport Playwright project (one config line) and a
minimal set of xs-viewport assertions for the touched surfaces, or it should
honestly state that the visual FRs ship with no automated regression
protection so the human can accept that with eyes open.

## O4 — specification quality — medium

### Claim

FR-6 replaces the hamburger drawer as *primary navigation* but says nothing
about what remains at the top of the screen. The current Navbar carries the
logged-in identity (username), the role indicator (Admin / Organizador), and a
profile shortcut. The spec specifies the bottom bar and the Más overflow
exhaustively, yet the fate of the top chrome is unspecified — one implementer
deletes the AppBar entirely (losing the role indicator, which has no other home
in the spec), another keeps a full AppBar alongside the bottom bar.

### Evidence

> **FR-6 [TDD]** (Change 1) `BottomNavigation` replaces the hamburger drawer
> as primary navigation

The FR enumerates bar items per role, the Más contents, active-state marking,
and bottom padding — and stops. No FR, acceptance scenario, or out-of-scope
bullet mentions the AppBar, the username display, or the admin/organizer badge
currently rendered by `client/src/components/navigation/Navbar.jsx`.

### Why this matters

"Which role am I signed in as" is load-bearing in an app whose navigation and
FAB visibility are role-gated (FR-6, FR-7). If the drawer's host component is
rewritten with no statement about the identity strip, that information can
silently disappear, and the divergence will only surface at review. One
sentence in FR-6 ("the top bar reduces to X / is removed; identity and role
display move to Y") closes the gap.

## O5 — scope — medium

### Claim

FR-4 lands `avatarColorFor(seed)` and the `palette.avatar` ring with zero
consumers, by the spec's own scoping. The one place avatars are colored today —
the user-chosen `iconColor` feature — is explicitly a non-goal. The mockup
surfaces that actually call `avatarColorFor` (chat-bubble sender coloring in
v6) fall under "Visual & UX Suggestions 1–7", which the Out-of-scope section
excludes. What ships is an exported utility justified as "available as
fallback/for new surfaces" — speculative API with no caller, in a change that
is otherwise strictly about landing audited fixes.

### Evidence

> **FR-4 [visual]** … The helper is available as fallback/for new surfaces;
> ripping out user-chosen colors is a product + server-model change that needs
> the maintainer.

> Out of scope … The audit's "Visual & UX Suggestions" 1–7

`docs/mockup/v6-mui-light.html` uses `avatarColorFor` for `UserAvatar` and
message sender names — the chat-bubble pattern is Suggestion 6, excluded.

### Why this matters

Dead exports invite drift: the hash function and swatch ring will sit untested
and unused until some future change adopts them, at which point they may no
longer match the mockup they were copied from. Deferring FR-4 to the change
that first needs it costs nothing now and keeps this spec's boundary honest.
If the maintainer conversation about `iconColor` resolves toward derived
colors, that change is the natural home for the utility.

## O6 — specification quality — medium

### Claim

FR-1 inherits "the documented contrastText decisions", i.e. white-on-coral at
3.6:1 with `primary.dark` (~5.1:1) as the escape hatch "where a contained
primary button must carry body-size (16px) label text to strict AA". Neither
document defines when a button *must*. The app's principal CTAs (Accede,
registrate, ¡Unete al evento!) are contained primary buttons with 16px labels.
One implementer ships them all coral (body-size text below 4.5:1 across the
app's most important actions); another darkens them all (visibly diverging
from the v6 mockup that the spec crowns as source of truth). Both can claim
compliance.

### Evidence

> **FR-1** … coral `#EA5347` primary / amber `#EFB666` secondary (with the
> documented contrastText decisions)

`docs/design-tokens-issue-14.md`: "Where a contained primary button must carry
body-size (16px) label text to strict AA, use `primary.dark` (`#C13A2E`,
~5.1:1 with white) as the fill. This is an explicit, accepted brand-fidelity
tradeoff — not an oversight." No criterion is given for which buttons the
"must" clause applies to.

### Why this matters

This is the single most user-visible ambiguity in the theme port. The spec
should state the default (e.g. "contained primary buttons stay coral
everywhere; the accepted 3.6:1 tradeoff applies app-wide, `primary.dark` is
reserved for future strict-AA contexts") or enumerate the buttons that take
the escape hatch — otherwise the decision gets made ad hoc, per component,
during implementation.

## O7 — implementation — medium

### Claim

A `position: fixed` BottomNavigation in a PWA installed to an iPhone home
screen sits in the home-indicator zone unless the bar itself gets
`env(safe-area-inset-bottom)` padding (plus `viewport-fit=cover`). FR-6
handles content clearance ("content gets bottom padding") but is silent on the
bar's own inset, and the v6 mockup the spec defers to contains no safe-area
handling anywhere — so the deferred source of truth cannot answer the question
either. The primary persona is a volunteer using the installed PWA on a phone;
on modern iPhones the bar's labels and lower touch zone would be occluded by,
and compete with, the system home gesture.

### Evidence

> the bar marks the active destination and navigates on tap; content gets
> bottom padding so nothing hides behind the fixed bar

Grep of `docs/mockup/v6-mui-light.html` for `safe-area` and `env(`: no
matches. User story: "As a volunteer using the Patas Arriba PWA on my phone…"

### Why this matters

This is the exact device class the change targets, and it is the kind of
defect the desktop-viewport Playwright net (O3) and a desktop-browser visual
check against the mockup will both miss. One clause in FR-6 ("the bar pads
itself with `env(safe-area-inset-bottom)`") makes the requirement testable and
prevents shipping a flagship mobile feature that is degraded precisely on
mobile.

## O8 — specification quality — medium

### Claim

FR-9 is stated as a universal ("Every icon-only button has an `aria-label`")
but is verified by a single-exemplar acceptance scenario ("any icon-only
button (e.g. message delete)"). A universal claim with example-based
verification is unfalsifiable: an implementation can pass the TDD gate while
leaving any number of icon buttons unlabeled, and conversely a reviewer can
reject conforming work by producing any stray icon button. The audit's Change
8 and its Files-Expected-to-Change table already contain the enumeration the
FR needs.

### Evidence

> **FR-9 [TDD]** (Change 8) Every icon-only button has an `aria-label` (edit,
> delete, expand/collapse, send, password visibility)

> **Given** any icon-only button (e.g. message delete), **then** it has a
> non-empty accessible name.

### Why this matters

FR-9 is one of the four FRs the spec commits to strict red-green TDD, so its
testable boundary must be exact. Either enumerate the buttons (the audit
already lists them: EventCard edit, Message delete, collapse triggers, send,
password toggles) so each gets a red test, or specify an enforcement mechanism
(an eslint jsx-a11y rule or a rendered-page RTL sweep) that makes "every"
mechanically checkable.

## O9 — scope — low

### Claim

`client/CLAUDE.md` — the guidance every agent session in the submodule loads —
states the two facts this spec exists to delete: "Custom Material-UI theme
with color palette defined in main.jsx" and "Foundation branding colors
(primary: #EFB665)". The spec's FR list and out-of-scope section never mention
updating it, so the client's own documentation is wrong on the day this ships,
and future agents will be primed with the superseded amber-primary theme.

### Evidence

`client/CLAUDE.md` § Theming: "Custom Material-UI theme with color palette
defined in main.jsx — Foundation branding colors (primary: #EFB665)". Spec
"Why this matters": "the client still ships the old hand-typed theme
(amber-primary `#EFB665` …)" — the change makes the doc false; no FR covers it.

### Why this matters

Stale agent guidance is a compounding cost in this project: the next Claude
session in `client/` will be told the primary is amber and the theme lives in
`main.jsx`, and may "correct" new work toward the old design. A one-line scope
addition ("update client/CLAUDE.md theming notes") closes it.

## O10 — alternatives — low

### Claim

The spec stands up an entirely new test harness (Vitest + RTL component tests,
"first component tests in the client — includes harness setup") to TDD four
FRs, without recording consideration of the materially cheaper alternative:
writing FR-6..FR-9's acceptance scenarios as Playwright e2e tests in the
existing root suite. The scenarios are already phrased as end-to-end journeys
(role-gated nav contents, FAB visibility per role, `inputMode` attributes,
accessible names), and the happy-path spec already logs in seeded
organizer/volunteer users. The hybrid *discipline* was user-approved; the
choice of harness for the TDD half appears not to have been weighed against
extending the suite that already runs.

### Evidence

> Hybrid: strict red-green TDD only for the behavior-bearing FRs (FR-6..FR-9)
> via Vitest + React Testing Library (first component tests in the client —
> includes harness setup)

`e2e/happy-path.spec.js` already authenticates role-specific users and asserts
on "Crear Evento"; every acceptance scenario in the spec is expressible as a
Playwright assertion. The spec records no rationale for component tests over
e2e for these four FRs.

### Why this matters

If the harness-setup cost is being paid primarily to serve this spec's four
FRs, the human should decide that knowingly — especially since the e2e route
would simultaneously shrink the regression-net gap raised in O3. If the
component-test harness is wanted for its own long-term sake, one sentence
saying so converts this from an unweighed alternative into a recorded decision.

## Explicitly not objecting to

- **The anonymous bottom nav duplicating Home's CTAs**: the item set comes
  straight from the audit's Change 1 and has no failure shape — it is a
  recorded design decision, which routes to the Choice Cartographer, not here.
- **The coral-primary flip and navy deletion**: the tokens doc documents the
  extraction from the live site and marks both reversals as user-confirmed
  curation decisions; re-litigating them would be challenging evidence I have
  no counter-evidence against.
- **The hybrid test discipline itself (TDD only for behavior-bearing FRs)**:
  explicitly user-approved 2026-07-08 in the spec; O10 challenges only the
  unweighed harness choice within it, not the approved split.
- **The five "Decisions proposed here" defaults**: the spec already flags them
  to the maintainer as unconfirmed proposals with rationale — the escalation
  path exists and each is a decision, not a latent failure.
- **`inputMode="email"` on Login's combined email-or-username field**: the
  field is "Correo Electronico o Nombre de Usuario", so the email keyboard is a
  judgment call with no failure mode (the layout still types usernames fine).
- **The "first component tests in the client" baseline claim**: the client
  submodule is mid-flight in the working tree, so I cannot establish whether
  the existing `client/tests/` files predate the spec; an objection on
  unverifiable evidence would be inadmissible by my own charter.
- **Desktop users losing the rem-inflation sizes (FR-2)**: shrinking desktop
  type is a deliberate consequence of the mobile-first charter of issues #14
  and #34, and the spec states the removal and its reason explicitly.
