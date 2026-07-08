# Changelog

Notable changes to the patas-arriba-monorepo workspace (harness, tooling,
and orchestration glue). Submodule code changes are recorded in their own
upstream repositories.

## 2026-07-08

### Issue #34 — mobile-first design system applied to the client

- **Landed the #14 design system in the app** (client submodule branch
  `feat/34-apply-design-system`): the v6 token theme ported to
  `client/src/theme.js` (coral primary, Staatliches display, named
  surface/brand/category/avatar tokens, touch-sized component defaults), the
  `App.css !important` block deleted, BottomNavigation replacing the
  hamburger drawer, a Crear Evento FAB for organizers, `inputMode` keyboard
  hints, icon-button aria-labels, and the responsive layout fixes from the
  audit's 10 changes.
- **Spec-first with a hybrid test discipline** (user-approved): spec at
  `docs/superpowers/specs/design-system-apply-frontend.md`; strict TDD only
  for the behavior-bearing changes (nav items per role, FAB visibility,
  keyboard hints, disclosure semantics — 13 new client tests), pure styling
  verified visually against the v6 mockup instead of tautological
  token-value assertions.
- **Open questions resolved by proposal, flagged for the maintainer**: same
  4-item bar for every role (Ver Usuarios lives under Más), FAB on the event
  list only, GoBack simplified to arrow + label, logout in the Más sheet,
  and user-chosen avatar colors kept (the derived `avatarColorFor` ring
  lands as a token, not a replacement).

## 2026-07-07

### Issue #14 — MUI design-system theme from the foundation's real branding

- **Extracted the real brand** from fundacionpatasarriba.com (live Elementor CSS
  variables + computed styles via Claude-in-Chrome), recorded in
  `docs/design-tokens-issue-14.md` with a per-token WCAG contrast check for each
  colour pair.
- **Reversed two brief assumptions** (confirmed with the maintainer): the brand
  *primary* is coral `#EA5347` with amber `#EFB666` as *secondary* — the site's own
  Elementor tokens — not amber-primary as guessed; and the navy `#173A5E` was
  incidental, so it is deleted (text is now a warm near-black). Display headings and
  the wordmark use the real brand face **Staatliches**; body/UI stay Roboto.
- **Built the token theme** in `docs/mockup/v6-mui-light.html` (v5 rebuilt on named
  tokens), fixing the six "no-reference" mistakes: inline hex → `surface`/`brand`/
  `category` tokens, the two category-colour systems unified into one
  `palette.category` map, documented `contrastText`, avatar colours derived via
  `avatarColorFor()`, and component styling moved off the `App.css !important` block
  into `theme.components`.
- **Published a 7-card component library** to a claude.ai Design project via
  `/design-sync`, generated from `docs/design-system/build-cards.mjs` so the cards
  never drift from the theme.
- **Pruned superseded early mockups** (`index.html`, `v2-native.html`,
  `v3-mui-dark.html`).

## 2026-07-03

### GitNexus moved to an on-demand `/gitnexus` skill

- **Removed the standing GitNexus block from `CLAUDE.md`.** GitNexus and CodeGraph
  were two redundant code-intelligence tools both mandating "run impact analysis
  before every edit"; the GitNexus block also pointed at a stale index. CodeGraph
  is now the sole always-on tool.
- **Captured GitNexus's full graph-first workflow as an invocable `/gitnexus`
  skill** (`devex/skills/gitnexus/`, symlinked into `.claude/skills/`), so its
  rigor — impact-before-edit, `detect_changes`-before-commit, guided rename,
  execution-flow debugging — is available on demand (`use /gitnexus to …`) rather
  than imposed on every task. The 6 GitNexus sub-skills moved with it.
- **Updated `docs/TOOLS.md`** to frame CodeGraph as primary/always-on and GitNexus
  as secondary/optional invoked via the skill.

### `devex/` tooling convention + scripts migration

- **Adopted the `devex/` layout** (borrowed from `avatia/monorepo`) for
  project-owned developer tooling: `devex/skills/` for skills we develop
  ourselves (authored here, symlinked into `.claude/skills/`; never symlinked
  into the `client/`/`server/` submodules) and `devex/scripts/` for scripts.
  Added `devex/README.md` and `devex/skills/README.md`; documented the
  convention in `CLAUDE.md` and `HARNESS.md`.
- **Migrated the root `scripts/` folder into `devex/scripts/`** — moved all seven
  scripts, fixed the `REPO_ROOT` depth (`$SCRIPT_DIR/../..`) in the four scripts
  that resolve it, and repointed every reference (HARNESS.md GC-rule tool paths,
  `.claude/hooks/session-start-verify-plugins.sh`, `.claude/commands/verify-setup.md`,
  `.claude/settings.local.json`, docs, README, `required-plugins.yaml`). Historical
  reflection entries keep their original paths.

### Harness template upgrade (v0.47.0 → v0.64.0)

- **Adopted the Affordances feature** — added the `## Affordances` section
  (with the template's example entries) plus two commented affordance
  constraints and three commented affordance GC rules to `HARNESS.md`, so the
  tool-identity governance surface is available to populate. Gitignored the
  per-machine `observability/affordance-invocations.json` recorder log.
- **Adopted the Cognitive reservoir block** — added the commented, opt-in
  advisory watch on verifier fatigue to `HARNESS.md`.
- **Migrated reflections to the per-fragment model** — split the monolithic
  `REFLECTION_LOG.md` into 12 per-entry fragments under `reflections/active/`,
  scaffolded `reflections/archive/`, and made `REFLECTION_LOG.md` a generated
  aggregate. Updated the reflection-archival GC rule and the `CLAUDE.md`
  Learnings section to describe the fragment model. Content preserved; same-date
  entries now sort deterministically by fragment filename.
- **Fixed the vendored-tool-path problem for reflections** — added repo-local
  wrapper scripts (`scripts/archive-promoted-reflections.sh`,
  `scripts/regenerate-reflection-log.sh`) that resolve the ai-literacy-superpowers
  plugin cache and its newest installed version at runtime and dispatch to the
  upstream script, so the GC-rule Tool: path stays stable across plugin upgrades.
  Pattern borrowed from `avatia/monorepo`. Repointed the reflection-archival GC
  rule at the wrapper.
- **Bumped the template-version marker** to `0.64.0` so the Template-currency
  GC rule reflects the current plugin.

### CodeGraph code intelligence across the monorepo

- **Wired CodeGraph into the workspace** — registered the `codegraph` MCP
  server (`.mcp.json`), allowlisted its read-only tools (`.claude/settings.json`),
  added the CodeGraph usage guidance (`.claude/CLAUDE.md`), and gitignored the
  local index files so the `.codegraph/` database never gets committed
  (`.codegraph/.gitignore`). A single query now spans both the `client/` and
  `server/` submodules.
- **Excluded `.claude-user/` from the index** via a root `codegraph.json`
  `exclude` pattern. The plugin marketplace under
  `.claude-user/plugins/marketplaces/` is an embedded git repo, which CodeGraph
  ≤1.0.1 indexed despite the `.gitignore` rule (upstream #514). Upgrading to
  1.2.0 makes gitignored embedded repos respect `.gitignore` by default, and the
  explicit `exclude` guarantees they stay out even for the one tracked file.
  Reindex dropped from indexing plugin/tooling code to 126 files of real app
  code (0 `.claude-user` nodes remain).

## 2026-06-14

### Harness audit follow-ups

- **Adopted the `docs/superpowers/` tree** as the home for all spec-first
  artefacts. Migrated the two existing specs from `/specs/` to
  `docs/superpowers/specs/`, created `objections/` and `stories/` directories
  (each with a README explaining its agent and the constraint it backs), and
  repointed the spec-location mandate in `CLAUDE.md` and `.claude/agents/spec-writer.md`.
  This resolves the divergence where the two agent constraints referenced a
  `docs/superpowers/` tree that did not exist. Pre-existing specs are marked
  `diaboli`/`cartographer: exempt-pre-existing` so they do not trip the PR gates.
- **Promoted two constraints from `unverified` to `agent` enforcement** —
  "Consistent formatting (client)" (ESLint) and "Tests must pass"
  (Playwright/Vitest by scope), both gated by harness-enforcer at PR-review
  time since the monorepo root has no CI by design. Enforcement ratio rose
  from 2/7 to 6/7.
- **Narrowed the "Convention file sync" GC rule** to the project's actual
  convention surfaces (the CLAUDE.md hierarchy and AGENTS.md), removing the
  phantom Cursor/Copilot/Windsurf references that were reported as missing.
- **Created the first observability snapshot** at
  `observability/snapshots/2026-06-14-snapshot.md` via `/harness-health`;
  refreshed the Status section and the README enforcement + health badges.
- **Upgraded the HARNESS.md template marker** from 0.39.0 to 0.47.0 via
  `/harness-upgrade` (no new template content to adopt — the harness was
  already a superset).
