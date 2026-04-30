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

## Development

### Option 1: Docker Compose (from host machine)

Starts client, server, and MongoDB as containers:

```bash
docker compose up
```

### Option 2: Dev Container

Open in VS Code with Dev Containers extension, or:

```bash
npx devcontainer up --workspace-folder .
```

Inside the devcontainer, MongoDB is already running. Start the app with:

```bash
npm run dev
```

### Scripts (root `package.json`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both server and client in parallel |
| `npm run dev:server` | Start only the server (nodemon, port 5005) |
| `npm run dev:client` | Start only the client (Vite, port 5173) |
| `npm run test:e2e` | Run Playwright E2E tests (headless) |
| `npm run test:e2e:headed` | Run tests in a visible browser |
| `npm run test:e2e:ui` | Open Playwright interactive UI mode |

## E2E Tests

The test suite uses Playwright and covers smoke tests, authentication flows, and a full happy path (event creation, user joining, car group management).

```bash
# Headless (parallel)
npm run test:e2e

# Visible browser, sequential (for watching tests)
npx playwright test --headed --workers=1

# Run a specific test file
npx playwright test happy-path
npx playwright test smoke
npx playwright test auth

# View the HTML report
npx playwright show-report
```

The Playwright config auto-detects the environment:
- **Host machine** — starts the full stack via `docker compose up`
- **Dev container** — starts client/server directly via npm (MongoDB already available)

Detection uses the `REMOTE_CONTAINERS` or `CODESPACES` environment variables.

A global setup script (`e2e/global-setup.js`) seeds MongoDB with test accounts before each run.

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

## Branch Protection

The monorepo has branch protection to prevent internal/tool-generated branches from being pushed to GitHub:

- **GitHub ruleset**: A branch ruleset blocks pushes to `entire/checkpoints/**` branches server-side. If migrating to a different Git host, recreate an equivalent rule.
- **Local pre-push hook**: `.git/hooks/pre-push` blocks pushes to any branch matching `*entire/checkpoints*` before they leave the machine.

These protections prevent AI tooling (e.g., Entire CLI) from publishing checkpoint branches to the public repository.

## AI Development Tools

This project uses several tools to support AI-assisted development with Claude Code. See [`TOOLS.md`](docs/TOOLS.md) for the full list and installation instructions.

| Tool | Purpose                                                                                                                                                 |
|------|---------------------------------------------------------------------------------------------------------------------------------------------------------|
| [RTK](https://www.rtk-ai.app/) | Token optimization — compresses CLI output ~89%                                                                                                         |
| [GitNexus](https://github.com/abhigyanpatwari/GitNexus) | Codebase knowledge graph via MCP                                                                                                                        |
| [Tessl](https://tessl.io/) | Package manager for AI agent skills/context                                                                                                             |
| [ccusage](https://ccusage.com/) | Claude Code token usage and cost tracking                                                                                                               |
| [ai-literacy-superpowers](https://github.com/Habitat-Thinking/ai-literacy-superpowers) | A set of plugins providing a complete development workflow — harness engineering, agent orchestration, literate programming, CUPID code review and more |

