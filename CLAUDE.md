# Patas Arriba Monorepo

Monorepo for **Fundación Patas Arriba** — a volunteer coordination platform for managing participation in the foundation's events.

## Structure

This monorepo contains two projects imported as Git submodules (changes must be committed back to their original repositories):

- **`client/`** — [patas-arriba-client](https://github.com/jorgeberrizbeitia/patas-arriba-client) (`git@github.com:jorgeberrizbeitia/patas-arriba-client.git`): React PWA (Vite + HMR), ESLint, push notifications via VAPID
- **`server/`** — [patas-arriba-server](https://github.com/jorgeberrizbeitia/patas-arriba-server) (`git@github.com:jorgeberrizbeitia/patas-arriba-server.git`): Node.js/Express API, Web Push, Docker, deployed via Fly.io

## Developer Experience (`devex/`)

Project-owned tooling that supports *working on* the monorepo lives under
[`devex/`](devex/), organised by kind (borrowed from `avatia/monorepo`). This is
the home for things **we** build — as distinct from product code (in the
submodules) or third-party plugins (in the Claude Code plugin cache). See
[`devex/README.md`](devex/README.md).

- **`devex/skills/`** — **skills we develop ourselves are authored here**, not
  directly in `.claude/skills/`. Each is surfaced to Claude Code with a per-skill
  relative symlink `.claude/skills/<name> → ../../devex/skills/<name>`;
  third-party skills stay as real dirs (or `.agents/skills/` symlinks) in
  `.claude/skills/`. **Never** symlink `.claude/skills/<name>` into the `client/`
  or `server/` submodules — the link dangles on submodule-less clones/CI and
  breaks tools that walk `.claude/`; keep a tracked copy instead. Full convention:
  [`devex/skills/README.md`](devex/skills/README.md).
- **`devex/scripts/`** — project scripts (dev/demo/seed helpers, harness
  tool-path wrappers, plugin verify/install). Superseded the old root `scripts/`
  folder; never place project tooling inside the `client/`/`server/` submodules.

## Tech Stack

- **Client:** React, Vite, PWA, VAPID push notifications
- **Server:** Node.js, Express, Web Push, Docker, Fly.io, GitHub Actions CI/CD
- **Top-level:** Playwright E2E (`e2e/`), devcontainer, docker-compose
- **Node version:** Pinned via `.nvmrc` in each submodule

## Development Setup

### Prerequisites
- Node.js (check `.nvmrc` in each submodule for version)
- npm

### Client (`client/`)
1. `cp .env.local.example .env.local`
2. Set `VITE_SERVER_URL` (e.g., `http://localhost:5005`) and `VITE_VAPID_PUSH_PUBLIC_KEY`
3. `npm install && npm run dev`

### Server (`server/`)
1. `cp .env.example .env`
2. Set: `ORIGIN`, `TOKEN_SECRET`, `EMAIL`, `EMAIL_PASSWORD`, `PUSH_SUBJECT`, `PUSH_PRIVATE_KEY`, `PUSH_PUBLIC_KEY`
3. Generate VAPID keys: `npm run generate-vapid-keys`
4. `npm install && npm start`

## Git Submodule Workflow

- All work on client/server code happens on branches in the **original repositories**
- The monorepo tracks specific commits of each submodule
- To update submodules: `git submodule update --remote`
- After cloning: `git clone --recurse-submodules <monorepo-url>`

## AI / Claude Code

This monorepo is structured to provide Claude Code with full context across both projects. The hierarchy for Claude Code configuration:
- **Root `CLAUDE.md`** (this file): overall project context, shared conventions
- **`client/CLAUDE.md`**: client-specific patterns, components, conventions
- **`server/CLAUDE.md`**: server-specific patterns, API routes, models

See [`TOOLS.md`](docs/TOOLS.md) for the full list of AI development tools used in this project (RTK, CodeGraph, GitNexus, Entire, Tessl, ccusage).

## Literate Programming

When creating a new source file or significantly rewriting an existing one, apply the
`/ai-literacy-superpowers:literate-programming` skill before writing any code.

The five rules in brief:

1. Every file opens with a narrative preamble — why it exists, key design decisions,
   what it deliberately does NOT do
2. Documentation explains reasoning, not signatures — WHY the design is this way,
   not what the function returns
3. Order of presentation follows logical understanding — orchestration before detail,
   concept before mechanism
4. Each file has one clearly stated concern — named in the first sentence of the preamble
5. Inline comments explain WHY, not WHAT — the code already shows what happens

## CUPID Code Review

When reviewing or refactoring code, apply the `/ai-literacy-superpowers:cupid-code-review` skill.

The five properties in brief:

1. **Composable** — can it be used independently without hidden dependencies?
2. **Unix philosophy** — does it do one thing completely and well?
3. **Predictable** — does it behave as its name suggests, with no hidden side effects?
4. **Idiomatic** — does it follow the grain of the language and project conventions?
5. **Domain-based** — do its names come from the problem domain, not the technical implementation?

## Workflow

### Spec-First Change Discipline

Any change to application behaviour must flow through the spec before touching
implementation code:

1. Update the spec — add or revise user stories, acceptance scenarios, and FRs
2. Update the implementation plan — reflect new or changed FRs
3. Write failing tests from the spec — confirm red before writing implementation
4. Update the implementation — until failing tests turn green
5. Refactor — clean up while keeping all tests green

**Specs live at `docs/superpowers/specs/` at the monorepo root — never inside
`client/` or `server/`.** Specs are project-management artefacts for the
monorepo team; the upstream submodule maintainers do not want them. The
`docs/superpowers/` tree also holds the adversarial-review records that the
spec-first PR gates require — `objections/` (from `/diaboli`) and `stories/`
(from `/choice-cartographer`) — so all spec-first artefacts live together.
Use suffixed filenames to disambiguate frontend vs backend concerns of the
same change (e.g. `docs/superpowers/specs/attendance-default-frontend.md`,
`docs/superpowers/specs/attendance-default-backend.md`).

### Test-Driven Development

Follow red-green-refactor strictly:

1. RED — write a failing test that describes the desired behaviour
2. GREEN — write the minimal production code needed to make the test pass
3. REFACTOR — clean up while keeping all tests green

No production code without a failing test first.

### Branch Discipline

Never commit directly to `main`. At the start of any task:

1. Create a GitHub issue in **`ascandroli/patas-arriba-monorepo`** describing the task
   (issues live only in the monorepo, never in the submodule repositories)
2. Create a branch: `git checkout -b <short-descriptive-name>`
   (lowercase, hyphen-separated, e.g. `add-search`, `fix-renderer-wrapping`)
3. Code changes that touch the submodules happen on branches in those upstream repos —
   the monorepo only tracks the resulting commit references

### Commit Messages

Write concise commit messages that describe what changed and why. No postamble,
no attribution lines. The message ends when the description ends.

### Pushing

Claude never runs `git push`. The user pushes manually after reviewing local commits.
Never amend commits that have already been pushed — create a new commit instead.

### CHANGELOG

Before every PR, update CHANGELOG.md:

- Add a dated section at the top if today's date is not already present
- Group entries under a short theme heading
- One bullet per change: what changed and why it matters

### PR Health Check

After every PR creation (the user pushes; Claude does not):

1. Run `gh pr checks <number> --watch`
2. If any check fails, fetch the log: `gh run view <run-id> --log-failed`
3. Fix every error, then commit (never amend) and push
4. Repeat until all checks are green

## Build and Test

The monorepo root is a Claude Code workspace, not a build target. Real builds, lints,
and unit tests live inside each submodule. Top-level commands:

    # Top-level E2E (Playwright, runs against client + server)
    npx playwright test

    # Client (in client/)
    cd client && npm run dev      # dev server with HMR
    cd client && npm run build    # production build
    cd client && npm run lint     # ESLint
    cd client && npm test         # Vitest

    # Server (in server/)
    cd server && npm start        # run API
    cd server && npm test         # server tests

Wrap any of these with `rtk` for token-optimized output (e.g. `rtk npx playwright test`,
`rtk npm run lint` from inside `client/`).

## Project Constraints

- **Issues belong only in `ascandroli/patas-arriba-monorepo`.** Do not open issues
  in the submodule repos — they receive code via PRs but are not the issue tracker.
- **Submodule code changes commit upstream, not to the monorepo root.** The monorepo
  records the resulting submodule commit pointers; the actual diff lives in the
  submodule repository.
- **Claude does not push.** All commits stay local until the user pushes.
- **No top-level CI at the monorepo root.** The submodules each run their own GitHub
  Actions; the root has no `.github/workflows/`. Do not add one without an explicit ask.
- **Devcontainer is the autonomous-agent target.** Any tooling Claude introduces
  must work inside `.devcontainer/` so the agent can run unattended there.

## Learnings

Reflections use the **per-fragment model**: each reflection is authored via
`/reflect` as its own file under `reflections/active/<YYYY-MM-DD>-<slug>.md`, so
two reflections written concurrently never collide.
[`REFLECTION_LOG.md`](REFLECTION_LOG.md) is a **generated, committed aggregate** of
those fragments (regenerate with `devex/scripts/regenerate-reflection-log.sh` — never
hand-edit it). Read recent entries before starting work to avoid repeating past
mistakes. Promoted fragments are archived by the weekly GC rule into
`reflections/archive/<YYYY>.md`.

[`AGENTS.md`](AGENTS.md) holds compound learning — patterns, gotchas, and architectural
decisions that have been promoted from a reflection fragment by human curation. When
promoting, add a `- **Promoted**: YYYY-MM-DD → <target>` line to the source fragment
in the same commit as the AGENTS.md/HARNESS.md edit, then regenerate the aggregate.

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (90-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk vitest run          # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%)
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->
