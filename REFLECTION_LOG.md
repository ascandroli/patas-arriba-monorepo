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
