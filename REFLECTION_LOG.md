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
