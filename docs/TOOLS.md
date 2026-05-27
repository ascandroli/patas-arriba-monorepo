# Tools

AI-assisted development tools used in this monorepo. All tools must be installed manually by the developer.

## Token Optimization

### [RTK (Rust Token Killer)](https://www.rtk-ai.app/)

CLI proxy that compresses command output by ~89% before it reaches Claude Code's context window. Saves tokens, extends sessions, improves reasoning.

- **Install:** `curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh` or `brew install rtk`
- **Claude Code setup:** `rtk init --global` (installs a PreToolUse hook automatically)
- **Track savings:** `rtk gain`

## Codebase Intelligence

### [GitNexus](https://github.com/abhigyanpatwari/GitNexus)

Indexes the codebase into a knowledge graph exposing dependencies, call chains, and execution flows via MCP. Gives AI agents deep architectural awareness.

- **Install:** `npm install -g gitnexus`
- **Index repo:** `npx gitnexus analyze`
- **Claude Code MCP:** `claude mcp add gitnexus -- npx -y gitnexus@latest mcp`

## Agent Context & Skills

### [Tessl](https://tessl.io/)

Package manager and registry for AI agent skills/context. Like npm but for agent knowledge — lets you find, install, and version structured context packages.

- **Website:** https://tessl.io/

## Usage Tracking

### [ccusage](https://ccusage.com/)

Analyzes Claude Code token usage and costs from local JSONL logs. Reports by day, month, session, or billing window with model breakdowns.

- **Run:** `npx ccusage@latest`
- **Flags:** `--breakdown` (per-model costs), `--since`/`--until` (date range), `--instances` (by project)

## Claude Code Plugins

Plugin requirements are declared in [`required-plugins.yaml`](../required-plugins.yaml) at the repo root. To verify and repair the environment:

```bash
scripts/verify-plugins.sh    # check for drift
scripts/install-plugins.sh   # fix drift (run from a fresh terminal)
```

See [`docs/PLUGINS-AND-SKILLS.md`](PLUGINS-AND-SKILLS.md) for the full plugin catalog, available skills and agents, and instructions for adding new plugins.