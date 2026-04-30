# Compound Learning

<!-- This file is the project's persistent memory across AI sessions.
     It accumulates patterns, gotchas, and decisions so that each session
     builds on what previous sessions learned — rather than rediscovering
     the same things from scratch.

     IMPORTANT: This file is often generated or updated by LLM agents.
     Review new entries with the same scepticism you would apply to any
     generated content. Entries should reflect observed reality in the
     codebase, not aspirational conventions. An entry in GOTCHAS that
     does not reflect an actual problem that was actually solved is noise
     that increases the cognitive cost of every future session.

     Curation flow: REFLECTION_LOG.md collects raw observations; humans
     promote durable patterns from there into the sections below. Do NOT
     auto-promote — only the human curator decides what graduates. -->

## STYLE

<!-- Patterns and idioms that work well in this codebase.
     Each entry: what to do, and why it works here. -->

<!-- (no entries yet — populate as patterns are confirmed across sessions) -->

## GOTCHAS

<!-- Traps, surprises, and non-obvious constraints. Initially empty — entries
     accumulate as the pipeline discovers them.
     Each entry: what the trap is, and how to avoid it. -->

<!-- (no entries yet) -->

## ARCH_DECISIONS

<!-- Key architectural decisions and the reasoning behind them.
     Each entry: what was decided, why, and what the alternatives were. -->

- **Decision**: The monorepo root (`patas-arriba-monorepo/`) is a Claude Code
  workspace, not a build/deploy target.
  **Reason**: It exists to give Claude unified context over `client/` and
  `server/` submodules. The submodules each have their own CI, builds, and
  releases — duplicating that at the root would add maintenance with no
  value.
  **Alternatives considered**: A true monorepo with shared CI (rejected —
  the upstream repos are independently owned and deployed); a flat
  workspace without git submodules (rejected — loses the ability to track
  exact submodule commits).

- **Decision**: GitHub issues are tracked only in
  `ascandroli/patas-arriba-monorepo`.
  **Reason**: One issue tracker keeps planning and triage in one place.
  Submodule repos receive PRs but do not host issues.
  **Alternatives considered**: Per-submodule issues (rejected — fragments
  the backlog; cross-cutting work spans both repos).

## TEST_STRATEGY

<!-- How tests are structured in this project. Helps agents write consistent
     tests without reading every test file from scratch. -->

- Top-level E2E tests use Playwright and live in `e2e/`. Configuration is
  in `playwright.config.js`. They exercise client + server together.
- Client unit tests use Vitest, colocated with the source they test, inside
  the `client/` submodule.
- Server tests live inside the `server/` submodule.
- When writing top-level E2E tests, target real running services (client
  dev server + server) rather than mocks — the value of E2E is catching
  integration regressions the unit suites cannot.

## DESIGN_DECISIONS

<!-- Interface contracts, data shapes, and design choices that are stable and
     that agents should not second-guess without good reason. -->

- **Push notifications use VAPID keys.** The client requires
  `VITE_VAPID_PUSH_PUBLIC_KEY`; the server requires `PUSH_PUBLIC_KEY`,
  `PUSH_PRIVATE_KEY`, and `PUSH_SUBJECT`. Generate matching pairs with
  `npm run generate-vapid-keys` in `server/`. Mismatched keys silently
  break delivery — verify both sides after rotation.
- **Submodule pointers, not source.** The monorepo's git history records
  submodule commit references. Editing submodule code from the monorepo
  root and committing only at the root would orphan the changes — they
  must be committed and pushed in the upstream repo first.
