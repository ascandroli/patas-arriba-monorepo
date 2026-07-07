# devex — Developer Experience tooling

Project-owned tooling that supports *working on* this monorepo, organised by
kind. This is the home for things **we** build and maintain — as opposed to
product code (which lives in the `client/` and `server/` submodules) or
third-party plugins (which run from the Claude Code plugin cache).

The name and layout are borrowed from `avatia/monorepo`, where this structure
keeps homegrown tooling from sprawling across the repo root.

## Layout

| Subfolder | Holds |
|-----------|-------|
| `skills/` | Skills we develop ourselves. Source of truth; symlinked into `.claude/skills/`. See [`skills/README.md`](skills/README.md). |
| `scripts/` | Project-owned scripts — dev/demo/seed helpers (`seed-demo.js`, `show-attendance.mjs`), harness tool-path wrappers (`archive-promoted-reflections.sh`, `regenerate-reflection-log.sh`), plugin verify/install (`verify-plugins.sh`, `install-plugins.sh`), CI fallback (`ai-literacy-check.sh`). Superseded the old root `scripts/` folder. |

Add subfolders (`tools/`, `plugins/`, …) as needs arise, following the same
"one folder per kind of tooling" rule.

## Why `devex/` instead of a flat `scripts/`

A single root `scripts/` folder mixes unrelated concerns (seed data, harness
wrappers, one-off utilities) and has no room for non-script tooling like skills.
`devex/` gives each kind of developer tooling its own named home, and makes
"is this ours or vendored?" answerable at a glance.

The docs/-consolidation aspiration: we keep the root uncluttered by ai-literacy
artefacts where it's cheap to do so, but do **not** force relocations that fight
the tooling (some artefacts — `HARNESS.md`, `AGENTS.md`, `REFLECTION_LOG.md`,
`CHANGELOG.md` — are expected at the root by plugins/agents and stay there).
