# Tools

AI-assisted development tools used in this monorepo. All tools must be installed manually by the developer.

## Token Optimization

### [RTK (Rust Token Killer)](https://www.rtk-ai.app/)

CLI proxy that compresses command output by ~89% before it reaches Claude Code's context window. Saves tokens, extends sessions, improves reasoning.

- **Install:** `curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/master/install.sh | sh` or `brew install rtk`
- **Claude Code setup:** `rtk init --global` (installs a PreToolUse hook automatically)
- **Track savings:** `rtk gain`

## Codebase Intelligence

The monorepo runs **two** code-intelligence graphs. CodeGraph is the **primary**
tool, always on. GitNexus is **secondary/optional** — kept for its execution-flow
processes and Cypher queries, but no longer a standing part of `CLAUDE.md`;
invoke it on demand with the `/gitnexus` skill. Both index across the `client/`
and `server/` submodules.

### [CodeGraph](https://www.npmjs.com/package/@colbymchenry/codegraph) — primary

SQLite knowledge graph of every symbol, edge, and file, exposed via MCP. One
`codegraph_explore` call returns the verbatim source of the relevant symbols
plus who calls them — Read-equivalent in far fewer tokens. A file watcher
auto-syncs on change. Excludes `.claude-user/` via root `codegraph.json`.

- **Install:** `npm install -g @colbymchenry/codegraph@latest` (keep ≥1.2.0 — see note below)
- **Index repo:** `codegraph index` (`--force` to rebuild)
- **Claude Code MCP:** already wired in `.mcp.json` as `codegraph serve --mcp` (or `codegraph install`)
- **Note:** `.claude-user/plugins/marketplaces/` is an embedded git repo; CodeGraph ≤1.0.1 indexed it despite `.gitignore` (upstream #514). ≥1.2.0 plus the `codegraph.json` `exclude` keeps it out.

### [GitNexus](https://github.com/abhigyanpatwari/GitNexus) — secondary/optional

Indexes the codebase into a knowledge graph exposing dependencies, call chains, and execution flows via MCP. Retained for its process/flow view and Cypher queries, which CodeGraph does not provide.

- **Invoke:** `use /gitnexus to <fix/debug/refactor> X` — the full graph-first workflow lives in the `/gitnexus` skill (`devex/skills/gitnexus/`), not in `CLAUDE.md`
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

## Conversational Programming

### [VoiceMode](https://github.com/mbailey/voicemode)

Two-way voice interface for Claude Code using local Whisper (STT) and Kokoro (TTS) services. Enables hands-free conversational programming through speech.

- **Install:** `pipx install voicemode`
- **Services:** Whisper (speech-to-text), Kokoro (text-to-speech)
- **Provides:** `converse` (speak + listen), `service` (manage Whisper/Kokoro/VoiceMode services)

## Claude Code Plugins

Plugin requirements are declared in [`required-plugins.yaml`](../required-plugins.yaml) at the repo root. To verify and repair the environment:

```bash
devex/scripts/verify-plugins.sh    # check for drift
devex/scripts/install-plugins.sh   # fix drift (run from a fresh terminal)
```

See [`docs/PLUGINS-AND-SKILLS.md`](PLUGINS-AND-SKILLS.md) for the full plugin catalog, available skills and agents, and instructions for adding new plugins.