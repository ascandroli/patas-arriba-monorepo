# GitNexus MCP Setup — Troubleshooting Log

## Goal

Add the GitNexus MCP server to the patas-arriba-monorepo project so Claude Code can use it for code intelligence (impact analysis, querying, refactoring, etc.).

## Environment

- **OS:** macOS (Darwin 24.6.0)
- **Node.js:** v24.14.1
- **Claude Code:** v2.1.87+

## Issue 1: MCP added to global config instead of project `.mcp.json`

### What happened

Running `claude mcp add` with the `--scope local` flag (or similar) added the server to the global `~/.claude.json` file under the project-scoped section, rather than creating a project-level `.mcp.json` file.

The output confirmed this:
```
Added stdio MCP server gitnexus with command: npx -y gitnexus@latest mcp to local config
File modified: /Users/ascandroli/.claude.json [project: /Users/ascandroli/development/workspace/patas-arriba-monorepo]
```

### Resolution

Manually created `.mcp.json` in the project root and removed the entry from `~/.claude.json`:

1. Created `/Users/ascandroli/development/workspace/patas-arriba-monorepo/.mcp.json`
2. Removed the `gitnexus` entry from `~/.claude.json` under `projects["/Users/ascandroli/development/workspace/patas-arriba-monorepo"].mcpServers`

## Issue 2: GitNexus MCP fails to load — `Cannot find module 'ajv'`

### What happened

After creating `.mcp.json` and restarting Claude Code, the MCP server appeared in the `/mcp` list but **failed to load**.

The error:
```
node:internal/modules/cjs/loader:1456
  const err = new Error(message);
              ^

Error: Cannot find module 'ajv'
Require stack:
```

### Root cause

The original command used `npx -y gitnexus@latest mcp`, which appears to have a dependency resolution issue with Node v24. The `-y` flag auto-confirms installation and `@latest` forces fetching the latest version, but the transitive dependency `ajv` was not properly resolved.

### Resolution

Simplified the `.mcp.json` command from:
```json
{
  "command": "npx",
  "args": ["-y", "gitnexus@latest", "mcp"]
}
```

To:
```json
{
  "command": "npx",
  "args": ["gitnexus", "mcp"]
}
```

Removing `-y` and `@latest` resolved the module resolution issue.

## Final working `.mcp.json`

```json
{
  "mcpServers": {
    "gitnexus": {
      "type": "stdio",
      "command": "npx",
      "args": ["gitnexus", "mcp"],
      "env": {}
    }
  }
}
```

## Key takeaways

1. **`claude mcp add --scope local`** writes to `~/.claude.json` (global file, project-scoped section), not to `.mcp.json`. To get a committable, project-level config, create `.mcp.json` manually.
2. **Node v24 + `npx -y pkg@latest`** can cause missing transitive dependencies (like `ajv`). Using `npx gitnexus` without `-y` and `@latest` avoids this.
3. **Claude Code requires a restart** to pick up changes to `.mcp.json`.