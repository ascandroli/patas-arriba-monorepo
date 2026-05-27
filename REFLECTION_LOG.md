# Reflection Log

<!-- Each entry is appended by integration-agent at the end of a pipeline run.
     Entries capture what was surprising, what went wrong, and what should be
     proposed for addition to AGENTS.md.

     Do NOT modify AGENTS.md directly from this log — only propose. Humans
     curate AGENTS.md. The value of this log is that it provides the raw
     material for curation, not that it auto-populates memory.

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
