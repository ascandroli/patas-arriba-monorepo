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

## SDLC Automation

### [Overcut](https://overcut.ai/)

Agentic SDLC control plane for triggering automated workflows against this repo. Connects via GitHub App and runs off-the-shelf playbooks from the [overcut-ai/overcut-playbooks](https://github.com/overcut-ai/overcut-playbooks) catalog directly from a web playground — no local CLI required.

- **Free tier:** 1 concurrent agent runtime — a second workflow must wait until the first finishes
- **Workflow builder:** https://overcut.ai
- **Playbooks installed:**
  - [`requirements-document-generation`](https://github.com/overcut-ai/overcut-playbooks/tree/main/requirements-document-generation) — generates a structured requirements document from an issue

### GitHub account setup

Overcut requires the connected GitHub account to **own** the repository — being a collaborator or developer is not sufficient for Overcut to discover it. To avoid granting Overcut access to all of the main account's repositories, a dedicated bot account was created:

- **Bot account:** [`amneris-bot`](https://github.com/amneris-bot)
- **Fork:** [`amneris-bot/patas-arriba-monorepo`](https://github.com/amneris-bot/patas-arriba-monorepo) — Overcut is connected to this fork, not the main repo
- **Issues:** GitHub disables issues on forks by default — they were enabled manually in the fork's settings so Overcut playbooks can target them
- Workflows are triggered against issues on the fork; any useful output is linked back to the corresponding issue in the main repo

## Claude Code Plugins

Plugin requirements are declared in [`required-plugins.yaml`](../required-plugins.yaml) at the repo root. To verify and repair the environment:

```bash
scripts/verify-plugins.sh    # check for drift
scripts/install-plugins.sh   # fix drift (run from a fresh terminal)
```

See [`docs/PLUGINS-AND-SKILLS.md`](PLUGINS-AND-SKILLS.md) for the full plugin catalog, available skills and agents, and instructions for adding new plugins.