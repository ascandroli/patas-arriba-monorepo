# Tools

AI-assisted development tools used in this monorepo. All tools must be installed manually by the developer.

## Development Framework

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

## Session History

## Claude Code Plugins

Plugins are installed via `/plugin install` inside Claude Code and enabled in `.claude/settings.json`.

### context7

Fetches up-to-date library and framework documentation on demand. Preferred over web search for API syntax, configuration, and version migration questions.

- **Source:** `claude-plugins-official`
- **Provides:** MCP server (`query-docs`, `resolve-library-id`)

### github

GitHub integration for working with issues, pull requests, and repositories directly from Claude Code.

- **Source:** `claude-plugins-official`

### typescript-lsp

TypeScript Language Server Protocol integration. Provides diagnostics, type checking, and code intelligence for TypeScript/JavaScript files.

- **Source:** `claude-plugins-official`
- **Provides:** LSP server

### claude-md-management

Tools for auditing and improving CLAUDE.md files. Scans for quality issues and makes targeted updates.

- **Source:** `claude-plugins-official`
- **Skills:** `/revise-claude-md`, `/claude-md-improver`

### skill-creator

Create, modify, and evaluate custom Claude Code skills. Includes benchmarking and performance measurement.

- **Source:** `claude-plugins-official`
- **Skills:** `/skill-creator`

### claude-code-setup

Analyzes the codebase and recommends Claude Code automations — hooks, subagents, skills, plugins, and MCP servers.

- **Source:** `claude-plugins-official`
- **Skills:** `/claude-automation-recommender`