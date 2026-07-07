# Patas Arriba Skills

Skills we develop and maintain ourselves for this monorepo. Marketplace skills
give a generic starting point; the ones here encode nuance specific to this
project — the client/server submodule split, the spec-first workflow, the
harness architecture, how we run CodeGraph/GitNexus over the codebase.

**This folder is the source of truth for skills we own.** A skill is authored
here under `devex/skills/<name>/`, gets tested, and — once stable — graduates to
a proper install. We keep our own skills out of `.claude/skills/` directly so
that "skills we wrote" and "skills we vendored/symlinked from elsewhere" never
get confused: `.claude/skills/` becomes a mix of third-party dirs and symlinks,
while `devex/skills/` is unambiguously ours.

## How a skill here reaches Claude Code

Claude Code only discovers skills under `.claude/skills/`. So each skill we own
is surfaced with a **per-skill relative symlink**:

```bash
# from repo root
ln -s ../../devex/skills/<name> .claude/skills/<name>
```

The symlink is relative (`../../devex/skills/<name>`), not absolute, so it
survives clone into a different path. Third-party skills stay as real
directories (or symlinks into `.agents/skills/`) directly in `.claude/skills/`.

### Gotcha: never symlink `.claude/skills/` *into a submodule*

This repo has `client/` and `server/` git submodules. A `.claude/skills/`
symlink whose target lives inside a submodule **dangles** whenever the submodule
isn't populated — fresh clones without `--recurse-submodules`, CI checkouts,
worktrees — and a dangling symlink breaks any tool that walks `.claude/`. If a
skill needs to live in a submodule, keep a **tracked copy** here instead of a
symlink, and record the source path + submodule commit in its frontmatter so
drift stays detectable. (See avatia/monorepo `new-package` for the precedent.)

## Lifecycle

| Stage | Where it lives | How it's wired |
|-------|----------------|----------------|
| **In development** | `devex/skills/<name>/` | symlinked into `.claude/skills/<name>` |
| **Graduated** | installed normally in `.claude/skills/<name>/` | real dir; symlink removed |

**Graduation:** when a skill is stable, install it as a real skill in
`.claude/skills/`, remove the symlink, and move its row to the Graduated table.

## In Development

| Skill | Invocation | Status | Issue |
|-------|-----------|--------|-------|
| `gitnexus` | `use /gitnexus to <fix/debug/refactor> X` | Symlinked at `.claude/skills/gitnexus` | — |

## Graduated

| Skill | Invocation | Notes |
|-------|-----------|-------|
| _none yet_ | | |

## Writing a skill for this repo

A skill is a `SKILL.md` with YAML frontmatter and a workflow body:

```yaml
---
name: my-skill
description: >
  One sentence trigger. Include the exact phrases a developer would use to
  invoke it: "use when...", "triggers on...". Keep triggers tight — over-broad
  descriptions fire the skill when nobody asked.
tools: Read, Glob, Grep, Bash, Edit   # only what the skill actually needs
---
```

Conventions:

- Reference real paths (`client/`, `server/`, `docs/superpowers/specs/`,
  `HARNESS.md`) not generic placeholders.
- Phase the workflow: Discovery → Plan → Confirm → Apply. Show a plan before
  making edits.
- Respect the project constraints in `CLAUDE.md` — issues only in
  `ascandroli/patas-arriba-monorepo`, Claude never pushes, submodule code
  changes go upstream.
