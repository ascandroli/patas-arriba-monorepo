# Claude Code Plugins & Skills

This document covers the plugin system for this monorepo: what plugins are installed, what skills and agents they provide, how to verify the environment is healthy, and how to add new plugins.

## Plugin declaration

[`required-plugins.yaml`](../required-plugins.yaml) at the repo root is the **source of truth** for what must be installed. Edit that file to add or remove plugins — do not edit `settings.json` by hand.

```yaml
# required-plugins.yaml (excerpt)
marketplaces:
  ai-literacy-superpowers:
    source: Habitat-Thinking/ai-literacy-superpowers

plugins:
  - ai-literacy-superpowers@ai-literacy-superpowers
  - claude-md-management@claude-plugins-official
  - context7@claude-plugins-official
  - github@claude-plugins-official
  - typescript-lsp@claude-plugins-official
```

`settings.json` is runtime state managed by the Claude CLI. The scripts keep it in sync with the YAML; you should not need to touch it directly.

## Verifying and repairing the environment

```bash
# Check for drift (exits 0 if clean, 1 if action needed)
scripts/verify-plugins.sh

# Fix all FAIL items (run from a fresh terminal, not inside Claude Code)
scripts/install-plugins.sh

# Preview what install would do without executing
scripts/install-plugins.sh --dry-run
```

Run `/verify-setup` inside a Claude Code session for a deeper check that also inspects which plugins are actually contributing capabilities to the live session (MCP tools, skills, agents).

### When to re-run install

- After cloning the repo for the first time
- After switching between the host machine and the devcontainer (plugin paths differ)
- Any time `verify-plugins.sh` exits 1
- After adding a plugin to `required-plugins.yaml`

### The host/devcontainer path problem

Claude Code stores the absolute install path of each plugin in `installed_plugins.json`. An entry installed inside the devcontainer records `/workspace/...` as the path; the same plugin installed on the host records `/Users/.../patas-arriba-monorepo/...`. Each environment can only load entries whose path matches the current machine.

`verify-plugins.sh` detects this mismatch and reports it as a `reinstall` FAIL. `install-plugins.sh` repairs it by refreshing the marketplace and reinstalling from the current host.

## Installed plugins

### `ai-literacy-superpowers` (Habitat-Thinking/ai-literacy-superpowers)

A comprehensive AI development workflow plugin. Provides the agents, skills, and harness infrastructure used throughout this project.

**Key agents:**

| Agent | When to use |
|-------|-------------|
| `orchestrator` | Start any new feature, fix, or refactor — coordinates the full pipeline |
| `spec-writer` | Capture a behaviour change in a spec before implementation begins |
| `tdd-agent` | Write failing tests after spec approval |
| `code-reviewer` | Review implementation through CUPID and literate-programming lenses |
| `integration-agent` | Commit, open PR, watch CI, merge, close issue, prune branch |

**Key skills (invoked with `/ai-literacy-superpowers:<name>`):**

| Skill | Purpose |
|-------|---------|
| `harness-init` | Scaffold HARNESS.md for a new project |
| `harness-constrain` | Add a constraint to HARNESS.md or promote an unverified one |
| `harness-audit` | Verify declared HARNESS.md enforcement matches reality |
| `assess` | Run an AI literacy assessment of the repository |
| `reflect` | Capture a session reflection into REFLECTION_LOG.md |
| `cupid-code-review` | Review code through the five CUPID properties |
| `literate-programming` | Apply literate-programming principles before writing a new file |
| `governance-audit` | Deep governance investigation — drift, debt, frame alignment |

### `claude-md-management` (claude-plugins-official)

Manages the project's `CLAUDE.md` file. Keeps it accurate and up to date as the codebase evolves.

**Key skills:**

| Skill | Purpose |
|-------|---------|
| `revise-claude-md` | Update CLAUDE.md with learnings from the current session |

### `context7` (claude-plugins-official)

Provides up-to-date library documentation via MCP. Fetches current docs for any library, framework, or SDK — React, Vite, Express, Playwright, and so on — so Claude is not limited to training-data knowledge.

**MCP tools:** `mcp__plugin_context7_context7__resolve-library-id`, `mcp__plugin_context7_context7__query-docs`

Use when: looking up API syntax, configuration options, version migration notes, or debugging library-specific behaviour.

### `github` (claude-plugins-official)

GitHub integration via MCP. Enables reading issues, PRs, checks, and repository data directly from the conversation.

### `typescript-lsp` (claude-plugins-official)

TypeScript Language Server Protocol integration. Provides real-time type checking and diagnostics as MCP tools, so Claude can verify type correctness without running a full build.

## Adding a plugin

**From `claude-plugins-official`** (the default marketplace):

1. Add the plugin id to `required-plugins.yaml` under `plugins`:
   ```yaml
   plugins:
     - new-plugin-name@claude-plugins-official
   ```
2. Run `scripts/install-plugins.sh` from a fresh terminal.

**From a new marketplace:**

1. Add the marketplace under `marketplaces` with its GitHub repo:
   ```yaml
   marketplaces:
     my-marketplace:
       source: org/repo-name
   ```
2. Add the plugin id under `plugins`:
   ```yaml
   plugins:
     - plugin-name@my-marketplace
   ```
3. Run `scripts/install-plugins.sh` from a fresh terminal.

The script will register the marketplace and install the plugin in one pass. `settings.json` is updated automatically by the Claude CLI during install.

## Removing a plugin

1. Remove its entry from `required-plugins.yaml`.
2. Run `claude plugin uninstall <id>` manually (the install script never auto-uninstalls).
3. Remove its marketplace entry from `required-plugins.yaml` if nothing else uses it.
