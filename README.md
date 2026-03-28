# Patas Arriba Monorepo

Monorepo for **Fundación Patas Arriba** — a platform to manage and coordinate volunteer participation in the foundation's events.

This monorepo brings together the client and server projects to enable AI-assisted development with [Claude Code](https://claude.ai/claude-code), providing full cross-project context for skills, agents, constraints, and workflows.

## Projects

| Project | Description | Tech Stack |
|---------|-------------|------------|
| [`client/`](https://github.com/jorgeberrizbeitia/patas-arriba-client) | React PWA for volunteers | React, Vite, PWA, VAPID push notifications |
| [`server/`](https://github.com/jorgeberrizbeitia/patas-arriba-server) | API backend | Node.js, Express, Web Push, Docker, Fly.io |

Both projects are included as **Git submodules** — changes are committed back to their original repositories.

## Getting Started

### Clone with submodules

```bash
git clone --recurse-submodules <monorepo-url>
```

If already cloned:

```bash
git submodule update --init --recursive
```

### Client setup

```bash
cd client
cp .env.local.example .env.local
# Set VITE_SERVER_URL and VITE_VAPID_PUSH_PUBLIC_KEY
npm install
npm run dev
```

### Server setup

```bash
cd server
cp .env.example .env
# Set ORIGIN, TOKEN_SECRET, EMAIL, EMAIL_PASSWORD, PUSH_SUBJECT, PUSH_PRIVATE_KEY, PUSH_PUBLIC_KEY
npm run generate-vapid-keys
npm install
npm start
```

## Submodule Workflow

Each submodule tracks a branch in its original repository. To work on a submodule:

```bash
cd client  # or server
git checkout <branch>
# make changes, commit, push to the original repo
```

To update submodules to latest:

```bash
git submodule update --remote
```

## AI Development Tools

This project uses several tools to support AI-assisted development with Claude Code. See [`TOOLS.md`](TOOLS.md) for the full list and installation instructions.

| Tool | Purpose |
|------|---------|
| [nWave](https://nwave.ai/) | AI development framework with TDD workflow |
| [RTK](https://www.rtk-ai.app/) | Token optimization — compresses CLI output ~89% |
| [GitNexus](https://github.com/abhigyanpatwari/GitNexus) | Codebase knowledge graph via MCP |
| [Tessl](https://tessl.io/) | Package manager for AI agent skills/context |
| [ccusage](https://ccusage.com/) | Claude Code token usage and cost tracking |
| [Entire](https://entire.io/) | Git-integrated AI session history |