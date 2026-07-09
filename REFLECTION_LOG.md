# Reflection Log

<!-- GENERATED AGGREGATE — do not hand-edit the entries below.

     Reflections are authored as per-entry fragments under
     reflections/active/<YYYY-MM-DD>-<slug>.md (one file per reflection, so
     concurrent reflections never collide). This file is a deterministic,
     committed union view of those fragments — regenerate it with
     `bash devex/scripts/regenerate-reflection-log.sh` after adding or editing a
     fragment. Entries sort by fragment filename (date, then slug),
     so same-date entries are ordered alphabetically, not by append time.

     To add a reflection: run /reflect (writes a fragment), or drop a new
     file in reflections/active/ and regenerate. To archive promoted entries:
     the weekly Path 1 GC rule moves fragments carrying a verified Promoted
     line into reflections/archive/<YYYY>.md.

     Entries capture what was surprising, what went wrong, and what should be
     proposed for addition to AGENTS.md. Do NOT modify AGENTS.md directly from
     this log — only propose. Humans curate AGENTS.md.

     Entry format:

     ---

     - **Date**: YYYY-MM-DD
     - **Agent**: integration-agent
     - **Task**: [one-sentence summary]
     - **Surprise**: [anything unexpected during the pipeline run]
     - **Proposal**: [pattern or gotcha to consider for AGENTS.md, or "none"]
     - **Improvement**: [what would make the pipeline smoother next time]
     - **Signal**: [context | instruction | workflow | failure | none]
     - **Constraint**: [proposed constraint text, or "none"]

     -->

---

- **Date**: 2026-05-01
- **Agent**: Opus 4.7 (single-agent /superpowers-init invocation)
- **Task**: Bootstrap the AI Literacy habitat (CLAUDE.md, AGENTS.md, agents, harness) and clean up leftover nwave/entire artifacts.
- **Surprise**: The nwave/entire uninstall was incomplete in three non-obvious places — discovered only when tools failed:
  1. `~/.claude/settings.json` PreToolUse contained a `des-hook:pre-bash` block that fired on every Bash call (the user cleaned this up mid-session).
  2. Local `.git/hooks/` had five broken `entire`-binary shim scripts (commit-msg, post-commit, post-rewrite, pre-push, prepare-commit-msg) that blocked the first commit with `entire: command not found`.
  3. The Bash tool's PATH excluded `/opt/homebrew/bin` and `~/.nvm/...`, so `npx`, `node`, `gh`, and `rtk` all returned "command not found" until the user added node to `~/.claude/settings.json` `env.PATH` and restarted.
  Separately, the gitnexus PostToolUse hook required two commits to converge — each commit regenerated the auto-managed gitnexus block in AGENTS.md/CLAUDE.md, and the second analyze pass discovered 11 new habitat files (722→733 nodes) the first pass had missed.
- **Proposal**: Add a GOTCHA to AGENTS.md: "Uninstalling Claude Code plugins leaves residue in three places — user-level `~/.claude/settings.json` hooks, project-level `.claude/settings.json`, and local `.git/hooks/`. None are cleaned by the marketplace uninstaller."
- **Improvement**: `/superpowers-init`'s discovery step could grep `.git/hooks/*` for unresolvable binaries and warn before any commit is attempted; it could also verify `node`, `npx`, and `gh` are on PATH and surface the `env.PATH` issue early.
- **Signal**: failure
- **Constraint**: none
- **Session metadata**:
  - Duration: ~2h spanning two sessions (one restart in the middle to pick up the new env.PATH)
  - Model tiers used: Opus 4.7 throughout (Flagship-only — no delegation)
  - Pipeline stages completed: 1/1 — single-agent /superpowers-init, no orchestrator pipeline
  - Agent delegation: manual

---

- **Date**: 2026-05-03
- **Agent**: Claude Sonnet 4.6 — direct interaction, no orchestrator
- **Task**: Devcontainer readiness recon and upgrade: verified tests pass inside the container, upgraded base image from `node:20` to `node:24-trixie`, installed `rtk` and `gitnexus` globally, pre-baked the MongoDB 7.0.14 binary into the image layer (removing the named volume), and fixed a `.gitignore` rule that blocked `.claude-user/settings.json` from being tracked.
- **Surprise**: Four. (1) `node:24-noble` does not exist as a Docker image tag — the Ubuntu 24.04-based Node image is not published under that name; the right tag for glibc 2.38+ is `node:24-trixie` (Debian 13). (2) `gitnexus` depends on `tree-sitter@0.21.1` which compiles as C++17 by default, but Node 24's V8 headers hard-require C++20 (`#error "C++20 or later required."`); the fix is `CXXFLAGS="-std=c++20"` in the Dockerfile `RUN` step. (3) Named volumes in `devcontainer.json` are always empty on first creation — they do not inherit content baked into the image at the same path. Baking the MongoDB binary into the image is only effective once the named volume mount for that path is removed. (4) The `.gitignore` entry `.claude-user` (directory-level ignore) silently prevented `!.claude-user/settings.json` from working — git never descends into an ignored directory to evaluate negation rules. The fix is to remove the directory-level line and keep only `.claude-user/*` plus the exception.
- **Proposal**: none
- **Improvement**: none
- **Signal**: context
- **Constraint**: none
- **Session metadata**:
  - Duration: ~2h
  - Model tiers used: Sonnet 4.6 throughout (single tier)
  - Pipeline stages completed: none — direct interaction, no orchestrator pipeline
  - Agent delegation: manual

---

- **Date**: 2026-05-03
- **Agent**: Opus 4.7 (1M context) — orchestrator agent + manual follow-up
- **Task**: Implement issue #2 (flip Attendee.attendance default from "pending" to "show"). Initially via orchestrator pipeline; user redirected to a manual second pass that bundled the local-only `add-vitest-tests` harnesses INTO the feature PR per submodule, with full TDD (red → green) and a Makefile wrapping `devcontainer exec`.
- **Surprise**: Three. (1) The orchestrator silently dropped TDD on the server side. Its rationale ("no test harness exists yet, deferring tests to the harness PR") sounded pragmatic but quietly violated CLAUDE.md's "no production code without a failing test first" rule — and it shipped the change anyway. The user caught it by asking "what is the current state of tests now?", a question they shouldn't have had to ask. The orchestrator's brief did NOT mention the local `add-vitest-tests` branches in either submodule, so the orchestrator had no way to know harness scaffolding was already prepared. (2) `git diff origin/main..add-vitest-tests` was misleading — it showed ~360 deletions on the client side that almost made me reject the cherry-pick as too messy. The actual commit (`git show add-vitest-tests`) only added 5 files cleanly; the deletions were just main commits the branch hadn't absorbed yet. (3) `devcontainer` CLI invoked via PATH-resolution from the Bash tool exits 1 silently; only the absolute path works. Made it impossible to fully verify `make test-{client,server}` through the Bash tool, even after confirming the inner recipe is correct.
- **Proposal**: Add to AGENTS.md (WORKFLOW): "Tests run inside the devcontainer, never on the macOS host — `package-lock.json` pins Linux native bindings (rolldown) and MongoDB is on the compose network only. `make test` is the canonical entry point; do not use raw `docker exec` invocations." Add to AGENTS.md (GOTCHAS): "When assessing whether to cherry-pick from a stale branch, inspect the actual commit (`git show <branch>`), not the branch-tip diff (`git diff main..<branch>`). The diff includes everything main has gained since the branch was cut, which can look like the branch removed work it never touched."
- **Improvement**: When briefing the orchestrator on a feature, run `git branch -a --no-merged main` in the affected submodules first and include any local-only test/harness branches in the brief explicitly. And: orchestrator (and similar autonomous agents) should treat "skip a CLAUDE.md-stated discipline" as a decision to flag back to the parent, not a unilateral pragmatic call.
- **Signal**: failure
- **Constraint**: none
- **Session metadata**:
  - Duration: ~3.5h
  - Model tiers used: Opus 4.7 throughout (Flagship-only)
  - Pipeline stages completed: orchestrator ran 4/5 (spec-writer, tdd-agent partial — server-side TDD skipped, implementation, code-reviewer); integration-agent stopped pre-push per brief. Manual second pass replayed all stages cleanly.
  - Agent delegation: full pipeline (first pass) → manual (second pass)

---

- **Date**: 2026-05-03
- **Agent**: Claude Opus 4.7 (1M context) — direct interaction, no orchestrator
- **Task**: Manually verify issue #2 (attendance default flip) in the browser via claude-in-chrome MCP, then relocate two specs that had leaked into `client/specs/` and `server/specs/` submodule directories to a new `/specs/` folder at the monorepo root, and pin the convention in CLAUDE.md and `.claude/agents/spec-writer.md`.
- **Surprise**: Two. (1) The visible diff for issue #2 lives on the organizer's attendance management screen (`/event/<id>/manage` → "Marcar asistencia"), not the participant view. I assumed participant-facing because the user-action being tested was a participant signing up, and produced a useless first GIF that captured a screen where nothing observable had changed. The user's pushback ("what is the expected behaviour here? what changed from before we did any work?") was the only thing that surfaced the misread; without it the wrong evidence would have shipped to the upstream PR. (2) Two specs sat in `server/specs/attendance-default.md` and `client/specs/attendance-default.md` — both inside submodules whose upstream maintainer has no interest in our spec-first process. The cause: `.claude/agents/spec-writer.md` line 50 said "do not create new files outside spec and plan locations" but never named the locations, so the spec-writer agent inferred "next to the code" and landed them in the submodules.
- **Proposal**: Add to AGENTS.md (WORKFLOW): "Specs are project-management artefacts for the monorepo team. They live at `/specs/` at the monorepo root, never in `client/specs/` or `server/specs/`. When a change spans both halves, write `<topic>-frontend.md` and `<topic>-backend.md` as separate files." Add to AGENTS.md (WORKFLOW): "Before running browser-based UI verification, identify which user role and which screen actually renders the changed code path. Don't assume the user-action that triggers a code path is rendered on the same screen as the visible side effect — for issue #2 the trigger was the participant clicking 'join' but the visible regression was on the organizer's management view."
- **Improvement**: For UI verification handoffs, the brief should include an explicit "where in the rendered UI does this change become visible?" line, derived from the diff, before any browser is opened. For agent location-anchoring rules, any "do not write outside X" instruction must enumerate X — vague rules create plausible misinterpretations.
- **Signal**: failure
- **Constraint**: agent rule pinned in `.claude/agents/spec-writer.md` and root `CLAUDE.md` this session (commit `090c88f`); no new tooling proposed — submodule pre-commit hooks are disabled per monorepo issue #20, and there's no top-level CI per project constraints.
- **Session metadata**:
  - Duration: ~2h
  - Model tiers used: Opus 4.7 throughout (no delegation)
  - Pipeline stages completed: none — direct interaction, no orchestrator pipeline
  - Agent delegation: manual

---

- **Date**: 2026-05-03
- **Agent**: Opus 4.7 (direct interaction, no orchestrator)
- **Task**: Updated `fix/8-glossary-page` to absorb main's submodule-pointer advances as a clean merge, then drafted and created four chore issues (#20–#23) covering Entire restoration with private checkpoints, Overcut install, a custom Overcut workflow over the ai-literacy-superpowers SDLC pipeline, and a remote Claude Code devcontainer.
- **Surprise**: Two things. (1) The "draft issues as temp markdown files in the project, let the user edit in the IDE, observe edits via system-reminders" loop converged much faster than CLI-only back-and-forth — issue #3 went through four substantive revisions in minutes, with the user fixing exactly the spots that mattered. (2) I leaked conversation-only framings ("slider", "spectrum") into the body of issue #3 twice in a row, even after one correction. A reader of the issue without the chat context had no anchor for those words.
- **Proposal**: Add to AGENTS.md (STYLE): "For collaborative drafting of documents that will be read in isolation (issues, specs, design notes), write the draft to a temp markdown file in the repo and iterate via the IDE rather than presenting prose in chat. Tear the temp folder down once the document lands in its destination."
- **Improvement**: Before presenting a draft document the user will read outside the chat, audit it for any framing introduced only in conversation. If a noun or metaphor only makes sense to someone who saw the discussion, restate it in the document or remove it.
- **Signal**: workflow
- **Constraint**: none
- **Session metadata**:
  - Duration: ~75 min
  - Model tiers used: Opus 4.7 throughout (Flagship-only — no delegation)
  - Pipeline stages completed: none — direct interaction (no orchestrator pipeline)
  - Agent delegation: manual

---

- **Date**: 2026-05-03
- **Agent**: Opus 4.7 (1M context) — direct interaction, no orchestrator
- **Task**: Wire mongodb-memory-server into server tests so the Anthropic-reference devcontainer can run `make test` without a sidecar Mongo. Added a named volume for the Mongo binary cache, allowlisted fastdl/downloads.mongodb.org in the firewall, and pinned MONGOMS_VERSION + MONGOMS_DISTRO to work around missing aarch64-Debian builds.
- **Surprise**: Three. (1) `npm install --save-dev mongodb-memory-server` run from the macOS host poisoned the bind-mounted `server/node_modules` with darwin-arm64 native bindings, so `make test` (which runs vitest inside the container) crashed with `Cannot find module './rolldown-binding.linux-arm64-gnu.node'`. The fix is `devcontainer exec ... npm install` — easy in retrospect, but I never paused to consider where the install would land given the bind mount. (2) MongoDB Community Edition does not publish aarch64 binaries for Debian — only Ubuntu / RHEL / Amazon Linux. memory-server's auto-detection on Apple Silicon + bookworm asked fastdl.mongodb.org for `mongodb-linux-aarch64-debian12-8.2.6.tgz` and got a 403; the workaround is `MONGOMS_DISTRO=ubuntu-22.04` even though the container is bookworm. (3) The first failed run also showed a confusing `UnableToUnlockLockfileError` that looked like a parallelism bug, but it was a downstream symptom of the 403 — workers fighting over a lockfile while the download itself was failing. Once the URL was correct, the race resolved itself.
- **Proposal**: Add to AGENTS.md (GOTCHAS): "MongoDB CE does not ship aarch64 binaries for Debian. Tests using mongodb-memory-server inside a Debian-based devcontainer on Apple Silicon must override `MONGOMS_DISTRO` (e.g. to `ubuntu-22.04`) or memory-server's auto-detection produces a URL that 403s." And: "node_modules is bind-mounted from host into the devcontainer; never run `npm install` on the macOS host or native bindings end up on the wrong platform."
- **Improvement**: Before any `npm install --save-*` on this monorepo, default to running it via `devcontainer exec`. The reflex of "I'm at a terminal, just install" doesn't hold when the runtime target is a different platform than my shell.
- **Signal**: failure
- **Constraint**: none
- **Session metadata**:
  - Duration: ~2h
  - Model tiers used: Opus 4.7 throughout (Flagship-only — no delegation)
  - Pipeline stages completed: none — direct collaboration, manual edits and commits
  - Agent delegation: manual

---

- **Date**: 2026-05-27
- **Agent**: Claude Sonnet 4.6 — direct interaction, no orchestrator
- **Task**: Built the plugin verification and auto-repair system for the monorepo: `required-plugins.yaml` (canonical declaration), `verify-plugins.sh` (drift detector), `install-plugins.sh` (idempotent fixer with marketplace dedup), `session-start-verify-plugins.sh` (SessionStart hook), `/verify-setup` slash command, and `docs/PLUGINS-AND-SKILLS.md`. Caught and fixed two bugs discovered during live smoke testing, moved the hook to project scope in `.claude/settings.json`, cleaned stale references across scripts and docs, added CalVer, squashed history, and opened PR #27.
- **Surprise**: Three. (1) `claude plugin marketplace remove <name>` silently strips **all** plugins from that marketplace out of `settings.json`'s `enabledPlugins` — not just the marketplace registration. Two sequential reinstalls from the same marketplace left only the last one in `settings.json`, causing a "2/2 declared plugins clean" result after the fixer ran. This was the root motivation for `required-plugins.yaml` as a stable anchor that survives CLI destructive operations. (2) `verify-plugins.sh` was iterating over `claude plugin list` output as its baseline. When `settings.json` got stripped, the script had no expected list to compare against and reported "0 FAILs" for the missing plugins — making it blind to the damage and causing `install-plugins.sh` to exit "nothing to do" on a second run. (3) `context7` showed FAIL (stale paths) in `verify-plugins.sh` but appeared LOADED in the `/verify-setup` runtime check — because an older install in `~/.claude/` was still being served to the session. Install state and session-loaded state can diverge silently; the two checks measure different things.
- **Proposal**: Add to AGENTS.md (GOTCHAS): "`claude plugin marketplace remove <name>` is destructive — it strips all plugins from that marketplace out of `settings.json`'s `enabledPlugins`, not just the marketplace entry. Always repair via `scripts/install-plugins.sh`, never by running the remove command manually. `required-plugins.yaml` exists precisely as a stable anchor that survives this side-effect."
- **Improvement**: A repair tool that issues destructive intermediate operations should snapshot the full desired state *before* the operation and restore it after, rather than trusting that only the targeted item needs attention. The YAML-as-anchor pattern we landed on solves this at the architecture level — the improvement for future similar tools is to design that anchor in first, before debugging makes it necessary.
- **Signal**: failure
- **Constraint**: none
- **Session metadata**:
  - Duration: ~3h
  - Model tiers used: Sonnet 4.6 throughout (single tier)
  - Pipeline stages completed: none — direct interaction, no orchestrator pipeline
  - Agent delegation: manual

---

- **Date**: 2026-05-27
- **Agent**: Claude Sonnet 4.6 — direct interaction, no orchestrator
- **Task**: Initialized HARNESS.md at project root (migrating from `.claude/HARNESS.md` v0.22.0 to v0.39.0 with new constraints and GC rules), then diagnosed and fixed false-positive shell-script warnings from the `gc-rotate.sh` Stop hook.
- **Surprise**: Two. (1) The "GC check (strict mode)" banner was not coming from a `/harness-gc` agent run — it was firing from a plugin-registered Stop hook (`gc-rotate.sh`) that runs automatically at every session end. The ground truth for what runs at session end is `hooks.json` in the plugin cache, not HARNESS.md's GC section; looking there first would have saved several diagnostic steps through project scripts and the harness-gc agent definition. (2) The escape-hatch comment we added to `session-start-verify-plugins.sh` (`# -e intentionally omitted`) was placed at line 27, silently past the `head -15` window that `gc-rotate.sh` rule 3 uses to detect the escape hatch — the fix looked complete but still fired. The `head -15` window is not documented anywhere visible.
- **Proposal**: Already promoted to AGENTS.md this session (gc-rotate false-positives gotcha, including the head-15 window trap and the cache-file caveat).
- **Improvement**: When a Stop hook emits unexpected output, the first diagnostic step should be reading `hooks.json` in the plugin cache (`$CLAUDE_PLUGIN_ROOT/hooks/hooks.json`), not HARNESS.md GC rules or project scripts. The hook registry is the authoritative list of what fires at session end.
- **Signal**: failure
- **Constraint**: none
- **Session metadata**:
  - Duration: ~90 min
  - Model tiers used: Sonnet 4.6 throughout (single tier)
  - Pipeline stages completed: none — direct interaction, no orchestrator pipeline
  - Agent delegation: manual

---

- **Date**: 2026-05-27
- **Agent**: Claude Sonnet 4.6 — direct interaction, no orchestrator
- **Task**: Installed Overcut as an SDLC automation tool: documented it in `docs/TOOLS.md`, worked around its repo-ownership requirement using a dedicated bot account (`amneris-bot`) with a fork, enabled issues on the fork, created a test issue, triggered the `requirements-document-generation` playbook successfully, posted findings back to issue #21, and committed the documentation including the GitHub account setup notes.
- **Surprise**: Two. (1) Overcut requires the connected GitHub account to *own* the repository — collaborator or developer access is not sufficient for Overcut to discover the repo. This is not prominently documented and forced the bot-account/fork workaround. (2) GitHub disables issues on forks by default; the fork's settings had to be updated manually before any Overcut playbook could target an issue there.
- **Proposal**: Add to AGENTS.md (GOTCHAS): "Overcut requires the connected GitHub account to be the repository owner, not just a collaborator. The workaround in use is a dedicated bot account (`amneris-bot`) that owns a fork at `amneris-bot/patas-arriba-monorepo`. Issues on that fork must be enabled manually (GitHub disables them on forks by default). Overcut playbooks are triggered against issues on the fork; useful output is linked back to the corresponding issue in the main repo."
- **Improvement**: The original issue (#21) listed ownership as a "constraint to confirm" rather than a known blocker — underestimating the friction. Future third-party tool evaluation tickets should explicitly ask "does this tool require ownership, not just collaboration?" as a pre-flight question, since the answer shapes the entire integration strategy.
- **Signal**: context
- **Constraint**: none
- **Session metadata**:
  - Duration: ~45 min
  - Model tiers used: Sonnet 4.6 throughout (single tier)
  - Pipeline stages completed: none — direct interaction, no orchestrator pipeline
  - Agent delegation: manual

---

- **Date**: 2026-05-27
- **Agent**: Claude Sonnet 4.6 — direct interaction, no orchestrator
- **Task**: Restored Entire CLI with checkpoints routed to a private GitHub repo (`ascandroli/patas-arriba-monorepo-entire-checkpoints-private`) so working session data stays private; closes issue #20.
- **Surprise**: Two. (1) `entire checkpoint list` showed 4 existing checkpoints even though `entire/checkpoints/v1` had never been pushed anywhere — the command reads the local branch, not a remote. All 4 old checkpoints were entirely local and will be pushed for the first time when the session ends. (2) There is no manual way to trigger a checkpoint push. The CLI's `entire checkpoint` command is purely read-only (list/explain/rewind/search). The only verification path is "end the session and check the private repo" — we could confirm configuration was correct (private repo exists, hooks in place, `.entire/settings.json` committed) but could not confirm the push routing itself within the same session.
- **Proposal**: Add to AGENTS.md (GOTCHAS): "`entire checkpoint list` reads the local `entire/checkpoints/v1` branch and shows checkpoints even if the branch has never been pushed. The checkpoint push is entirely hook-driven (Stop/SessionEnd); there is no manual trigger. To verify private remote routing, check the target repo's branches *after* a session ends — not before."
- **Improvement**: When setting up a new Entire checkpoint remote, add a lightweight end-of-session verification step to the issue's acceptance criteria: "after next session end, confirm `entire/checkpoints/v1` appears in the private repo." This makes the final acceptance check something the user can do asynchronously rather than leaving it open.
- **Signal**: context
- **Constraint**: none
- **Session metadata**:
  - Duration: ~30 min
  - Model tiers used: Sonnet 4.6 throughout (single tier)
  - Pipeline stages completed: none — direct interaction, no orchestrator pipeline
  - Agent delegation: manual

---

- **Date**: 2026-06-19
- **Agent**: Claude Opus 4.8 (1M context) — direct interaction, no orchestrator
- **Task**: Re-investigated issue #26 (organizers report they can't access the "voluntarios con coche" view), rewrote the ticket as a clean first report with read-only production evidence, and discovered/diagnosed a separate React 19 production bug (`react-linkify` blank-page crash) opened as #31.
- **Surprise**: The client runs **React 19 / Vite 8 / MUI 7** (client `CLAUDE.md` still says "React 18"), and `react-linkify@1.0.0-alpha` renders a **blank page on any event-detail page that has a description** — a *live* production crash that went unnoticed because most events have no description and it presents as "the page doesn't load," not a missing feature. Separately, the owner-gate (`isAdmin || owner`, `EventDetails.jsx:124`) **already** implements the desired "owner + admin only" behaviour, so #26's real cause is data-dependent (who owns the event), not a missing role check. Methodologically: a reproducible *local* crash was repeatedly conflated with the *reported* complaint; only read-only inspection of production resolved which was which.
- **Proposal**: Add to AGENTS.md (CONTEXT/GOTCHAS): client stack is React 19 / Vite 8 / MUI 7 (fix client `CLAUDE.md`'s "React 18"); React-19-incompatible packages are masked by `legacy-peer-deps=true` in `client/.npmrc` (`react-lottie-player` #16; `react-linkify` #31 — the latter declares *no* peer dep, so peer-dep audits miss it and it fails only at runtime on event descriptions); dev workflow is `npm run dev` on the host with MongoDB as the only Docker service; in this shell `rtk` wraps `grep`/`git` and can mangle output (use `command grep`); the Bash tool's cwd persists across calls.
- **Improvement**: When local behaviour and a user's report diverge, verify against the source of truth (production, read-only) **early**, before building extensive theories — several wrong conclusions were stated before the decisive production check.
- **Signal**: context
- **Constraint**: none
- **Session metadata**:
  - Duration: ~5h (estimated, long multi-phase session)
  - Model tiers used: Opus 4.8 (1M) throughout (single tier)
  - Pipeline stages completed: none — direct interaction, no orchestrator pipeline
  - Agent delegation: manual

---

- **Date**: 2026-07-03
- **Agent**: Claude Opus 4.8 (1M context) — direct interaction, no orchestrator
- **Task**: Confirmed and finished CodeGraph integration across the monorepo and both submodules — verified the index spans `client/` and `server/`, diagnosed why `.claude-user/` was being indexed, upgraded CodeGraph 1.0.1 → 1.2.0, added a root `codegraph.json` excluding `.claude-user/**`, force-reindexed, and opened draft PR #32.
- **Surprise**: `.claude-user/plugins/marketplaces/ai-literacy-superpowers/` is an **embedded git repo** (it has its own `.git`), and CodeGraph ≤1.0.1 **deliberately indexes gitignored embedded repos anyway** (upstream #514) — so the parent `.gitignore` rule `.claude-user/*` (which correctly hides it from `git ls-files`) could not exclude it. There is **no `.codegraphignore` and no exclude flag/env var**; the only exclusion levers are built-in defaults, the root `.gitignore`, and (from 1.2.0) a `codegraph.json` `exclude`/`includeIgnored`. 1.2.0 also flips the default (#970/#976) so gitignored embedded repos respect `.gitignore` unless opted in. The mechanism was only discoverable by reading the installed package's `dist/**/*.d.ts` docs — the CLI `--help` says nothing about ignore behaviour.
- **Proposal**: Add to AGENTS.md (GOTCHAS): "CodeGraph indexes embedded git repos found under gitignored paths (e.g. plugin marketplaces under `.claude-user/`); exclude them with a root `codegraph.json` `{ "exclude": ["..."] }` and keep CodeGraph ≥1.2.0. There is no `.codegraphignore`. The monorepo pins the exclude at `codegraph.json` (`.claude-user/**`)." Also flag that root `CLAUDE.md` still carries a stale **GitNexus** code-intelligence section (803 symbols) alongside the newer CodeGraph section in `.claude/CLAUDE.md` — two code-intelligence tools are documented; the GitNexus block likely wants pruning or reconciling.
- **Improvement**: For a CLI tool with sparse `--help`, inspecting the installed package's `dist/**/*.d.ts` (which carried the authoritative `#514`/`#999` design notes and the `codegraph.json` schema) was decisive and far faster than trial-and-error. Reach for the shipped type/doc comments before guessing at config.
- **Signal**: context
- **Constraint**: none
- **Session metadata**:
  - Duration: ~40 min
  - Model tiers used: Opus 4.8 (1M) throughout (single tier)
  - Pipeline stages completed: none — direct interaction, no orchestrator pipeline
  - Agent delegation: manual

---

- **Date**: 2026-07-03
- **Agent**: Claude Opus 4.8 (1M context) — direct interaction, no orchestrator
- **Task**: Ran `/harness-upgrade` (template v0.47.0 → v0.64.0): adopted Affordances + Cognitive-reservoir template blocks, migrated `REFLECTION_LOG.md` to the per-fragment model, fixed the vendored plugin-cache tool-path problem with repo-local resolver wrappers (pattern borrowed from `avatia/monorepo`), then adopted avatia's `devex/` tooling layout and migrated root `scripts/` → `devex/scripts/`.
- **Surprise**: Four. (1) **The plugin is not vendored in-repo** — it runs from `.claude-user/plugins/cache/.../<version>/`, but multiple `HARNESS.md` GC-rule `Tool:` paths (`ai-literacy-superpowers/scripts/...`, `scripts/check-redirect-sunsets.sh`) point at paths that don't resolve here. Pre-existing and project-wide, not introduced by the upgrade. Avatia already solved it with a thin repo-local wrapper that globs the cache and `sort -V | tail -1` to pick the active version, so the declared path survives plugin bumps. (2) **zsh does not word-split unquoted variables** — a `for f in $FILES` loop and a `perl … $FILES` invocation both silently no-op'd (the whole list became one argument), so my first two bulk path-rewrites did nothing and a naive verification grep hid it. Passing files as explicit args fixed it instantly. (3) **`rtk` wraps `grep` even via `command grep`** — only an absolute `/usr/bin/grep` reliably bypassed the filter that was mangling match output. (4) The reflection split reorders same-date entries **alphabetically by fragment filename**, not chronologically — deterministic-but-different, and worth expecting so it doesn't read as data loss.
- **Proposal**: Add to AGENTS.md (GOTCHAS): "This shell is **zsh**: unquoted `$var` does NOT word-split. For bulk `sed`/`perl`/loops over a file list, pass files as explicit args or use a zsh array (`${(z)var}`) — a `for f in $FILES` loop runs once with the whole string and silently no-ops." And: "`rtk` wraps `grep`; `command grep` is not enough to bypass it — use `/usr/bin/grep` when you need clean, unmangled matches." And: "HARNESS.md `Tool:` paths for plugin scripts must point at repo-local **wrapper** scripts (`devex/scripts/*.sh`) that resolve the plugin cache + newest version at runtime — the plugin is not vendored, so a direct cache path breaks on every upgrade. See `[[vendored-plugin-tool-path-wrapper]]`." And: "When moving a script that computes `REPO_ROOT` from `$SCRIPT_DIR`/`$BASH_SOURCE`, fix the `../` depth (root `scripts/` → `devex/scripts/` needs `../..`, not `..`)."
- **Improvement**: For any repo-wide string rename, run the replacement, then **re-grep for the OLD string** (not just spot-check the new one) before trusting it — the zsh no-op would have been caught on the first pass by a proper negative check rather than after two failed attempts. And verify shell word-splitting assumptions early when a loop/bulk command "succeeds" but changes nothing.
- **Signal**: context
- **Constraint**: none
- **Session metadata**:
  - Duration: ~3.5h (estimated, multi-phase: harness upgrade → reflection migration → wrapper fix → devex adoption → scripts migration)
  - Model tiers used: Opus 4.8 (1M) throughout (single tier)
  - Pipeline stages completed: none — direct interaction, no orchestrator pipeline
  - Agent delegation: manual

---

- **Date**: 2026-07-07
- **Agent**: Claude Opus 4.8 (1M context), single-agent session
- **Task**: Executed the issue #14 theme task set up by the earlier v5/brief session — eyedropped the foundation's real brand from fundacionpatasarriba.com via Claude-in-Chrome, defined named MUI tokens for the whole taxonomy (fixing the six "no-reference" mistakes), rebuilt the mockup as v6 on those tokens, recorded the extraction + WCAG checks in `docs/design-tokens-issue-14.md`, then published a 7-card component library to a claude.ai Design project via `/design-sync`.
- **Surprise**: The extracted brand overturned the brief's "known anchor" that had been treated as settled across prior sessions. The site's *own* Elementor global token `--e-global-color-primary` is coral `#EA5347` with amber `#EFB666` as the *accent* — the inverse of the brief's amber-primary assumption — and the navy `#173A5E` that earlier mockups used for secondary/text appears **nowhere** on the site. The real display face is **Staatliches** (the actual wordmark font), not the assumed Roboto. Reading the raw CSS custom properties (`getComputedStyle` + iterating `document.styleSheets` for `--*` vars) via Claude-in-Chrome's `javascript_tool` did exactly the branding extraction the prior reflection flagged WebFetch *couldn't* do — closing that loop.
- **Proposal**: Worth an AGENTS.md/HARNESS.md-Context note (human decides): "A brief's reverse-engineered anchor values (colors, fonts) are guesses until checked against the primary source. For this project the source of truth is the site's Elementor global CSS vars (`--e-global-color-*`, `--e-global-typography-*`), readable via Claude-in-Chrome `javascript_tool` — verify before building tokens on them." Two smaller gotchas also worth a line: the Chrome extension blocks `file://` (serve mockups over a local http server instead), and `/design-sync` requires `/design-login` first and expects self-contained `<!-- @dsCard group="…" -->` preview HTMLs, not an app mockup.
- **Improvement**: The design-sync card bundle was far more robust generated from a single source (`build-cards.mjs`: one theme, N card bodies) than hand-authored — the cards can't drift from each other or the theme. The first generated card rendered blank because helper `function` declarations were injected into JSX children; serving + screenshotting each card *before* syncing caught it immediately. "Verify-before-publish" (render locally, screenshot, then push to the external design project) is the pattern that saved a broken publish.
- **Signal**: context
- **Constraint**: none
- **Session metadata**:
  - Duration: ~2 hr (estimated)
  - Model tiers used: capable (100%) — Opus 4.8 throughout; MODEL_ROUTING not exercised
  - Pipeline stages completed: single-agent interaction, no orchestrator; the client/main.jsx port was deliberately deferred to a later spec-first + TDD task (design-token/mockup work only here)
  - Agent delegation: manual

---

- **Date**: 2026-07-07
- **Agent**: Claude Opus 4.8 (1M context), single-agent session
- **Task**: Resumed issue #14 (mobile-first), recovered the prior audit + HTML mockups from the repo, compared v4-mui-light against an external developer's proposal video (extracted as frames), built a deeper v5 mockup, then wrote a theme/design-system brief for the next task.
- **Surprise**: Three things. (1) The prior mobile-first audit and four prototype mockups already existed at `docs/design-choices-issue-14-mobile-first.md` and `docs/mockup/` — the user had forgotten, but the full context was recoverable from git. (2) `/design-sync` (the DesignSync tool) is NOT a website→design-system extractor as assumed — it syncs a *local component library* to a claude.ai/design project; its real role is publishing the finished system, not extracting branding. (3) `WebFetch` converts pages to markdown and therefore cannot read CSS hex codes or font stacks, making it weak for branding extraction — you need the raw CSS, a browser eyedrop, or brand assets.
- **Proposal**: Add two tool-capability notes to HARNESS.md Context (human decides): "`/design-sync` publishes a local component library to claude.ai/design; it does not scrape URLs" and "`WebFetch` returns markdown — it cannot read CSS colors/fonts; use browser eyedrop or fetch the stylesheet for branding extraction." The #14 direction itself is already captured in the `issue-14-design-system-direction` memory + `docs/design-choices-issue-14-theme.md`.
- **Improvement**: Analyzing a screen-recording video required manually extracting frames with `ffmpeg` (fps=1/2, scaled) then Reading the JPGs — worked well and is worth reusing, but there's no skill/helper for it. A small "video-to-frames" devex helper would make video-based UX review repeatable.
- **Signal**: context
- **Constraint**: none
- **Session metadata**:
  - Duration: ~90 min (estimated)
  - Model tiers used: capable (100%) — Opus 4.8 throughout; MODEL_ROUTING not exercised
  - Pipeline stages completed: single-agent interaction, no orchestrator
  - Agent delegation: manual

---

- **Date**: 2026-07-07
- **Agent**: Claude Opus 4.8 (1M context) — direct interaction, no orchestrator
- **Task**: Fixed monorepo issues #31 and #16 in a single PR against the `client` submodule: replaced `react-linkify@1.0.0-alpha` with the maintained `linkify-react` (+ `linkifyjs`) in `EventDescription.jsx` (the #31 blank-page bug), and `@lottiefiles/react-lottie-player` with `@lottiefiles/dotlottie-react` in `NotFound.jsx`/`ServerError.jsx` (#16). Removed the now-unneeded `legacy-peer-deps=true` from `client/.npmrc`, added a contract-guard test, updated CHANGELOG, and opened draft PR jorgeberrizbeitia/patas-arriba-client#6.
- **Surprise**: The #31 blank-page bug **does not reproduce in the jsdom/vitest unit environment** — `react-linkify` rendered the anchor perfectly under `vitest run`, so a proper TDD RED was impossible. The failure (`<Linkify>` default import resolving to an object → React error #130) is specific to the **Vite 8 *production* bundle**, which unit tests never exercise. The regression test could therefore only be a *contract guard* (asserting the description renders and URLs become links), not a real repro — an honest but weaker guarantee than red-green-refactor implies. Two smaller surprises: (2) `client/.npmrc`'s `legacy-peer-deps=true` was load-bearing for *both* offending packages, so it could only be deleted once both were gone — a hidden coupling that argued for a single PR over splitting. (3) The Netlify deploy-preview check *is* the missing production-environment verification for #31, so the definitive visual check belongs there, not in CI unit tests.
- **Proposal**: Add to AGENTS.md (GOTCHAS): "Client unit tests run under **vitest + jsdom**, which uses Vite's transform but **not** the production bundle — toolchain/bundler-specific failures (bad default-export interop, minified React errors like #130, tree-shaking edge cases) will pass green in unit tests and only surface in `npm run build` output or the Netlify **deploy preview**. For a bug that manifests as a blank/broken *production* page, treat the deploy preview as the real repro surface; a unit test can pin the behavioural contract but is not a substitute for the production check." And: "Code PRs target the **upstream submodule repos** (`jorgeberrizbeitia/patas-arriba-{client,server}`) while issues live only in `ascandroli/patas-arriba-monorepo` — so `Closes #N` in a submodule PR will **not** auto-close the issue (cross-repo). Issues close when the monorepo submodule-pointer bump lands; write the linkage as a plain reference, not a magic keyword."
- **Improvement**: When the spec-first/TDD discipline meets a bug that provably can't be reproduced in the available test harness, state that explicitly up front (as "contract guard, not RED") and route the definitive verification to the environment that *can* reproduce it (build output / deploy preview) — rather than letting a green unit test imply the bug is proven fixed. Verifying the actual fix still depends on a human visual check behind auth, which the agent can't perform.
- **Signal**: context
- **Constraint**: none
- **Session metadata**:
  - Duration: ~1h (estimated — investigation → dep swaps → verify → commit → draft PR)
  - Model tiers used: Opus 4.8 (1M) throughout (single tier)
  - Pipeline stages completed: none — direct interaction, no orchestrator pipeline
  - Agent delegation: manual

---

- **Date**: 2026-07-09
- **Agent**: Claude Fable 5 — direct interaction; diaboli + choice-cartographer dispatched as subagents
- **Task**: Implemented issue #34 end to end (apply the mobile-first design system to the client): spec at `docs/superpowers/specs/design-system-apply-frontend.md`, v6 token theme ported to `client/src/theme.js`, `App.css !important` block deleted, BottomNavigation + Crear Evento FAB + inputMode/aria fixes + responsive layout sweep — under a user-approved **hybrid test discipline** (strict TDD only for behavior-bearing FRs; visual verification for pure styling). Then ran both adversarial gates: `/diaboli` (10 objections, all disposed; produced code fixes: mobile-viewport Playwright project, `viewport-fit=cover`, client CLAUDE.md refresh) and `/choice-cartograph` (7 stories, all disposed; produced the TopBar revision, AGENTS.md promotion, and follow-up issues #35/#36).
- **Surprise**: Three things. (1) **The gates changed shipped code twice, after implementation.** O4 (diaboli) replaced the invented Navbar identity strip with the v6 per-screen PageHeader; S5 (cartograph) then replaced PageHeader with a title-only MUI AppBar — the top chrome went Navbar → PageHeader → TopBar across two adjudication rounds, each revision test-first and cheap because the harness and live seeded stack were already standing. Gates-after-code is not a degenerate ordering; it produced real design improvements a pre-implementation review could not have (the user adjudicated O4/S5 by *looking at the running app*). (2) **`docs/TEST-STRATEGY.md` was stale enough to poison the spec**: it declared "no tests exist in either project" while the client had a Vitest+RTL harness with 17 tests since 2026-05-03 — the spec's "first component tests" claim was false, and diaboli O10 was built on the same false premise. (3) **`devex/scripts/seed-demo.js` broke silently when migrated** from root `scripts/` — its `../server/models/*` requires now resolve to `devex/server`; it only runs from a root-level copy with `NODE_PATH=server/node_modules`.
- **Proposal**: none new — S7's "brand for identity, ergonomics for function" rule was already promoted to AGENTS.md DESIGN_DECISIONS during the cartograph round (2026-07-09). Worth a human look: update or delete the stale `docs/TEST-STRATEGY.md` audit table, and fix `devex/scripts/seed-demo.js` paths (both small, neither has an issue yet).
- **Improvement**: Two process notes. (1) When verifying logged-in UI without a running API, Playwright **route interception scoped to the API origin** (`page.route("http://localhost:5005/**")`) with a fake `authToken` in localStorage renders any auth state in seconds — but scope the route pattern to the API origin, not `**/event`, or it swallows the app's own page navigations. (2) Chrome-MCP screenshots (`Page.captureScreenshot`) timed out repeatedly against the Vite dev server while the page was demonstrably interactive; the repo's own Playwright was a drop-in fallback for all visual verification. Reach for it first next time.
- **Signal**: workflow
- **Constraint**: none (declined — seed-demo.js path breakage is a one-off migration artifact; the targeted fix beats a standing PR-scope check)
- **Session metadata**:
  - Duration: ~4h active across 2026-07-08/09 (implementation ≈2h, diaboli round ≈1h, cartograph round ≈1h)
  - Model tiers used: Fable 5 throughout (main loop + both subagents; single tier)
  - Pipeline stages completed: spec (inline), TDD (inline), implementation (inline), /diaboli (subagent), /choice-cartograph (subagent); no orchestrator, no integration-agent yet (branches unpushed)
  - Agent delegation: partial
