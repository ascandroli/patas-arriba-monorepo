---
spec: docs/superpowers/specs/design-system-apply-frontend.md
date: 2026-07-08
mode: spec
cartographer_model: claude-fable-5
stories:
  - id: 1
    lens: [defaults, forces]
    title: Frozen mockup outranks the reasoned audit
    disposition: accepted
    disposition_rationale: "The precedence rule stands with the story's own nuance made explicit: 'v6 wins' is a deterministic tiebreaker subject to human ratification, not an oracle — future audit/mockup conflicts get judged on their merits with v6 as the default, exactly as O2 and O7 played out. Disposed by ascandroli 2026-07-09."
  - id: 2
    lens: [patterns, alternatives]
    title: Three hand-synced token copies, no pipeline
    disposition: revisit
    disposition_rationale: "Triple maintenance is accepted for this PR only. Follow-up issue #35 tracks choosing a consolidation strategy (crown theme.js / DTCG-JSON generation / retire the mockup) before the next theme-touching change (dark mode, chat bubbles). Disposed by ascandroli 2026-07-09."
  - id: 3
    lens: [alternatives, forces]
    title: Big-bang cutover over independent audit changes
    disposition: accepted
    disposition_rationale: "Bundling stands: the App.css/theme swap is only safe atomically, and one maintainer round-trip beats eleven. The Step 1 / Step 2 seam is the documented fallback split if upstream review stalls. Disposed by ascandroli 2026-07-09."
  - id: 4
    lens: [forces, patterns]
    title: Anonymous visitors get the full app shell
    disposition: revisit
    disposition_rationale: "Initially deferred to issue #36, then resolved in-branch the same day: reviewing the logged-out state made the duplication concrete, and the full-bleed auth funnel won — anonymous users get no bar (the landing CTAs are the only path in; login/signup rely on the top-bar back arrow). Implemented test-first; #36 closes with the PR. Disposed by ascandroli 2026-07-09."
  - id: 5
    lens: [consequences, defaults]
    title: Role identity becomes sought, not ambient
    disposition: accepted
    disposition_rationale: "Adjudication revised the decision rather than ratifying it: MUI's standard scaffold is fine as a known pattern, so a sticky title-only AppBar returns (screen title in the brand display face) — but it carries no identity, role, avatar or overflow; identity stays on Perfil. PageHeader (greeting + avatar) is deleted; implemented test-first in client commit beacafd, superseding the O4 resolution detail. Disposed by ascandroli 2026-07-09."
  - id: 6
    lens: [forces, consequences]
    title: Build first, confirm with maintainer after
    disposition: accepted
    disposition_rationale: "Build-first stands and is now explicit policy: the user directed 2026-07-09 that maintainer sign-off is not a blocker. The carrier for the five proposed defaults is the upstream PR description, where the maintainer adjudicates them at review time. Disposed by ascandroli 2026-07-09."
  - id: 7
    lens: [coherence]
    title: Brand for identity, ergonomics for function
    disposition: promoted
    disposition_rationale: "The rule is real and load-bearing; promoted to AGENTS.md DESIGN_DECISIONS 2026-07-09: brand wins where an element carries identity (primary color, display type, token vocabulary); ergonomics wins where it carries function (body type, inputs, touch geometry, radii). Disposed by ascandroli 2026-07-09."
---

# Choice Stories — Apply the mobile-first design system to the client (spec mode)

## Story #1 — Frozen mockup outranks the reasoned audit

**Source:** `docs/superpowers/specs/design-system-apply-frontend.md` (Sources of truth)
**Lens:** defaults, forces
**Refs:** O2

**Context.** The spec inherits two upstream documents that occasionally disagree: the mobile-first audit (`docs/design-choices-issue-14-mobile-first.md`, reasoned findings with per-change rationale) and the v6 mockup (`docs/mockup/v6-mui-light.html`, a rendered artifact). The spec installs a blanket precedence rule: "Where the audit and the v6 theme disagree … **v6 wins** — it postdates and supersedes the audit's sketches."

**Forces.** A spec built on two sources needs a deterministic tiebreaker, and recency is the cheapest one. Pulling the other way: the audit carries *reasons* (each change has a Why), while a mockup's choices can be incidental — something rendered a certain way because that's what got typed, not because it was decided. Recency-based precedence privileges the artifact that explains itself least.

**Options not taken.** Audit-wins (rationale outranks rendering, with the mockup as illustration only); per-conflict adjudication logged in the spec as each disagreement surfaces; folding both documents into the tokens doc as the single normative text and demoting the mockup to a build artifact.

**Choice as written.** Blanket recency precedence: the frozen HTML file is the constitution; the audit is history.

**Consequences.** Future design questions get answered by opening a static HTML file — which always renders an answer, including to questions it never considered. The rule's two live tests during the diaboli round are instructive: on the touch-floor conflict (O2) the human ratified v6's 44px IconButton, but on *independent* grounds (Apple HIG, dense rows) rather than by mechanical precedence; and on safe-area handling (O7) the mockup was silent, so the rule produced nothing. Worth recording: in practice the rule operated as a tiebreaker subject to human ratification, not an oracle. Future conflicts should be resolved the same way, not by rote "v6 wins".

**Pattern.** This looks like Golden Master (characterization-testing lineage, Feathers, *Working Effectively with Legacy Code*, 2004) applied to design review: correctness is defined as fidelity to a frozen reference artifact rather than to stated requirements.

## Story #2 — Three hand-synced token copies, no pipeline

**Source:** `docs/superpowers/specs/design-system-apply-frontend.md` (FR-1) + `docs/design-tokens-issue-14.md`
**Lens:** patterns, alternatives
**Refs:** #1

**Context.** After this spec lands, the token system exists in three hand-maintained representations: the tokens doc (prose tables, declared "the single source of truth"), the v6 mockup's theme block (declared to "implement exactly these tokens"), and now `client/src/theme.js` (FR-1's "faithful port"). All three are synchronized by human transcription.

**Forces.** Shipping speed and zero new tooling for a small foundation app, versus a genuinely single source. The project adopted the *vocabulary* of design tokens — named slots, `surface.*`, `brand.*`, `palette.category` — which normally comes bundled with the tooling half of the pattern: one machine-readable source, everything else generated. Here the "single source of truth" is a markdown file no build step reads.

**Options not taken.** A machine-readable token file (W3C DTCG-style JSON) with generation into both the mockup and `theme.js` (Style Dictionary or a 50-line script); crowning `theme.js` itself as the single source once ported, regenerating the doc tables from it; deleting the mockup after the port on the grounds that a reference that has been transcribed has served its purpose.

**Choice as written.** The spec chose triple maintenance by not addressing consolidation — Story #1's precedence rule exists precisely because there are multiple authorities to rank.

**Consequences.** Every future palette or override change is a three-file edit, enforced only by discipline. The mockup starts aging the day the app evolves past it (dark mode is out of scope *now*; the chat-bubble redesign is queued). Nothing is permanently foreclosed, but the consolidation cost grows with each divergence, and the "which copy is right" question — currently answered by Story #1's rule — gets harder each time the app gains a token the mockup lacks.

**Pattern.** Design Tokens (originating with Salesforce Lightning Design System, ~2014; W3C Design Tokens Community Group draft). The spec adopts the pattern's naming discipline while declining its single-source/generation half — a legitimate partial adoption, but an unnamed one.

## Story #3 — Big-bang cutover over independent audit changes

**Source:** `docs/superpowers/specs/design-system-apply-frontend.md` (whole-document structure)
**Lens:** alternatives, forces
**Refs:** —

**Context.** The audit was explicitly structured for incremental landing: "Changes are listed in implementation order. Each change is independent and can be reviewed separately." The spec bundles the entire theme port (FR-1..FR-5) plus all ten audit changes (FR-6..FR-15) into one issue (#34), one client branch, and therefore one upstream PR to a submodule maintainer who does not participate in this spec process.

**Forces.** Visual coherence pulls toward one cutover: a half-migrated app (coral buttons beside amber ones, `App.css !important` overrides fighting the new theme) looks broken in a way neither old nor new does, and the `App.css` deletion is only safe atomically with the theme that replaces it. Submodule economics pull the same way — every upstream PR costs a maintainer round-trip, so batching minimizes them. Pulling against: review burden and bisectability. The maintainer receives one large diff spanning navigation architecture, theme, and a dozen component edits.

**Options not taken.** Strangler-fig sequencing per the audit's own ordering (theme PR first, then change-by-change PRs); a two-PR split along the spec's own Step 1 / Step 2 seam; landing the nav swap (the riskiest UX change) behind a cheap toggle.

**Choice as written.** The spec chose bundling by not addressing packaging at all — it numbers steps within one spec and lets the branch structure decide.

**Consequences.** Reverting any single audit change post-merge means manual surgery rather than a `git revert`. The Step 1 / Step 2 seam the spec itself draws is available as a fallback split if upstream review stalls. In exchange: no mixed-theme intermediate state ever ships, and the maintainer conversation happens once.

**Pattern.** Declines Strangler Fig (Fowler, 2004) in favor of big-bang cutover — defensible at this codebase's size, worth naming because the audit was explicitly written to enable the strangler route.

## Story #4 — Anonymous visitors get the full app shell

**Source:** `docs/superpowers/specs/design-system-apply-frontend.md` (FR-6)
**Lens:** forces, patterns
**Refs:** —

**Context.** FR-6 gives anonymous visitors a persistent bottom bar — Inicio, Acceso, Registro — on a Home screen that already presents access and registration CTAs. The diaboli explicitly declined this as an objection (no failure shape) and routed it here as a recorded design decision.

**Forces.** One navigation architecture across auth states: the shell is always present, and login is a bar-content swap rather than a layout transformation — no jarring appearance of chrome at the moment of authentication. Pulling against: screen economy for the user with exactly one task. An anonymous visitor on a 320px phone spends ~56px of viewport on a bar duplicating the two CTAs already dominating the screen.

**Options not taken.** No bar until authentication, treating login/signup as a full-bleed funnel (the common consumer-app idiom); a minimal two-item bar (Acceso, Registro) without Inicio; leaving Home's CTAs as the only anonymous path, per the pre-change behavior.

**Choice as written.** Full shell from first paint, item set taken verbatim from audit Change 1's role table.

**Consequences.** The navigation component keeps one mental model (a role-keyed item map, exactly what FR-6's acceptance scenarios test); the PWA reads as an app from the first render, which matters for install prompts. The redundancy cost is confined to two screens anonymous users pass through once. If the funnel-style alternative is ever wanted, it now requires *removing* chrome conditionally — the inverse conditional of what was avoided.

**Pattern.** App Shell model (Osmani / Google PWA guidance, 2015): constant chrome, swapping content — applied here across authentication states, not just routes.

## Story #5 — Role identity becomes sought, not ambient

**Source:** `docs/superpowers/specs/design-system-apply-frontend.md` (FR-6, "No global top bar")
**Lens:** consequences, defaults
**Refs:** O4

**Context.** O4's resolution deleted the Navbar outright: no global top bar, main screens own their headers via `PageHeader` (greeting, display-face title, avatar shortcut), and role information lives on the Perfil screen only. The disposition records *what* was resolved; the consequence terrain of that resolution is what this story maps.

**Forces.** Two fixed bars would eat both ends of a small phone's viewport, and the v6 mockup — the crowned source of truth — has no global top bar. Pulling against: ambient context. The old Navbar made "who am I signed in as, with what role" visible everywhere; in an app whose affordances are role-gated (FR-6's Más contents, FR-7's FAB), role was load-bearing chrome.

**Options not taken.** A slim persistent identity strip; a role badge decorating the bottom bar's Perfil item; role displayed in the Más overflow header, where the role-gated items already live.

**Choice as written.** Role is sought, not ambient: discovering it requires navigating to Perfil. Per-screen headers become a convention each new screen must opt into, not a guarantee the layout component provides.

**Consequences.** The UI now communicates role primarily through which affordances *appear* — an organizer wondering why they can't see the FAB must visit Perfil to debug their own session. Every future screen must remember its `PageHeader`; the enforcement mechanism is code review, not composition. The spec also quietly declines MUI's most idiomatic default (the `AppBar` at the top of virtually every MUI scaffold) in favor of per-screen composition — an inherited-default *rejection* worth recording, since future sessions steeped in MUI convention may try to "restore" it.

**Pattern.** —

## Story #6 — Build first, confirm with maintainer after

**Source:** `docs/superpowers/specs/design-system-apply-frontend.md` (Decisions proposed here)
**Lens:** forces, consequences
**Refs:** #3

**Context.** The spec lists five decisions "flag to maintainer, not yet confirmed" — nav item sets, FAB placement, GoBack redesign, logout placement, avatar-color survival. The implementation of all five already exists on `feat/34-apply-design-system`. The audit had posed four of these as open questions *for* the maintainer; the spec answers them and builds.

**Forces.** Momentum and demonstrability: a working bottom bar is a better basis for a maintainer conversation than a hypothetical, and blocking a full theme-plus-audit landing on four UX preference questions would stall the whole of issue #34. Pulling against: upstream authority and anchoring — the submodule belongs to its maintainer, and reviewing a finished implementation raises the cost of choosing otherwise. Working code is an argument, not just an artifact.

**Options not taken.** Blocking Step 2 on the audit's open questions while landing the uncontroversial Step 1 theme; implementing the contested items behind cheap toggles (e.g. the 4-vs-5-item bar as a config array); sending the maintainer the v6 mockup for adjudication before building.

**Choice as written.** Implement all five proposed defaults now; record them in the spec as proposals with rationale.

**Consequences.** The maintainer adjudicates against a fait accompli — reversal is real rework (restoring Usuarios to a 5-item bar re-opens FR-6's tested role matrix), which biases the conversation toward acceptance. The honest flag in the spec is the mitigation, but "not yet confirmed" has no expiry, owner, or tracking mechanism; unconfirmed proposals of this kind harden into permanence by default if the conversation never happens. If the team wants these to remain genuinely open, something must carry them to the upstream PR description.

**Pattern.** —

## Story #7 — Brand for identity, ergonomics for function

**Source:** `docs/superpowers/specs/design-system-apply-frontend.md` (whole document) + `docs/design-tokens-issue-14.md` (curation decisions)
**Lens:** coherence
**Refs:** O5, O6, #1

**Context.** Brand fidelity and usability floors collide repeatedly across this spec, and every resolution lands the same way without the rule ever being stated. Coral stays at 3.6:1 on contained buttons app-wide because the foundation's own site does it (O6). Instrument Serif — genuinely part of the brand — is excluded from body text because a display serif at 14–16px hurts phone legibility; Staatliches gets h1/h2 only. Body and input sizes revert to MUI defaults for the iOS-zoom floor. Radii keep v5's soft touch values over the site's "sharp 3–5px desktop-marketing" radii. The avatar ring lands consumer-less to keep the theme "a faithful port rather than a subset" (O5).

**Forces.** Brand fidelity versus interaction ergonomics — the central tension of the entire theme port, resolved five separate times, five separate ways of saying the same thing.

**Options not taken.** Brand-maximalism (serif body, site radii, coral everywhere including where AA demands otherwise); accessibility-maximalism (`primary.dark` CTAs, strict 48px universal); explicit per-token adjudication with no unifying principle — which is what the documents *appear* to contain.

**Choice as written.** The spec applies, case by case and silently, a coherent rule: **brand wins where an element carries identity** (primary color, display type, the token vocabulary itself); **ergonomics wins where an element carries function** (body type, inputs, touch geometry, radii). The one apparent exception — O2's 44px icon floor — fits too: it is ergonomics (density in dense rows) beating a different authority's floor, not brand beating ergonomics.

**Consequences.** Unnamed, the rule must be re-derived by every future session, and the next collision (dark mode, the chat-bubble redesign, any new component) risks a resolution that contradicts the existing five. Named, it converts future collisions from re-litigations into applications. This is the strongest promotion candidate in this record: one sentence in AGENTS.md DESIGN_DECISIONS would carry it.

**Pattern.** This is the Alexander "quality without a name" situation the coherence lens exists for — the coherence is real and load-bearing; only the name is missing.

## Decisions deliberately not storied

- **The coral-primary flip and navy deletion** — user-confirmed curation decisions, fully recorded with rationale in `docs/design-tokens-issue-14.md`; a story would repeat the doc.
- **The consumer-less avatar ring and the app-wide coral policy as individual decisions** — recorded in FR-4/FR-1 and adjudicated as O5/O6; they appear here only as evidence inside Story #7.
- **The hybrid test discipline and the [visual]/[TDD] tagging** — explicitly user-approved 2026-07-08 and recorded in the spec; residual verification-gap concerns are failure-shaped and were the diaboli's O3, already disposed.
- **The rem-inflation removal shrinking desktop type** — the spec states both the removal and its reason; the diaboli explicitly declined it as a deliberate mobile-first consequence. No unrecorded decision remains.
- **`Glossary` category unification, `CssBaseline` adoption, `viewport-fit=cover`** — each recorded with rationale in the spec or tokens doc; storying them fails the weak-story test (repeats the spec back to itself).

*Reflection-log read mode: bounded (last 90 days / entries through 2026-07-07, including the issue #14 v5/v6 sessions that produced this spec's sources of truth). No archive opt-in — the decision arc begins 2026-07-07 and is fully inside the window.*
