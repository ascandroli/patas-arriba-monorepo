# Patas Arriba Monorepo

Monorepo for **Fundación Patas Arriba** — a volunteer coordination platform for managing participation in the foundation's events.

## Structure

This monorepo contains two projects imported as Git submodules (changes must be committed back to their original repositories):

- **`client/`** — [patas-arriba-client](https://github.com/jorgeberrizbeitia/patas-arriba-client) (`git@github.com:jorgeberrizbeitia/patas-arriba-client.git`): React PWA (Vite + HMR), ESLint, push notifications via VAPID
- **`server/`** — [patas-arriba-server](https://github.com/jorgeberrizbeitia/patas-arriba-server) (`git@github.com:jorgeberrizbeitia/patas-arriba-server.git`): Node.js/Express API, Web Push, Docker, deployed via Fly.io

## Tech Stack

- **Client:** React, Vite, PWA, VAPID push notifications
- **Server:** Node.js, Express, Web Push, Docker, Fly.io, GitHub Actions CI/CD
- **Node version:** Pinned via `.nvmrc` in each submodule

## Development Setup

### Prerequisites
- Node.js (check `.nvmrc` in each submodule for version)
- npm

### Client (`client/`)
1. `cp .env.local.example .env.local`
2. Set `VITE_SERVER_URL` (e.g., `http://localhost:5005`) and `VITE_VAPID_PUSH_PUBLIC_KEY`
3. `npm install && npm run dev`

### Server (`server/`)
1. `cp .env.example .env`
2. Set: `ORIGIN`, `TOKEN_SECRET`, `EMAIL`, `EMAIL_PASSWORD`, `PUSH_SUBJECT`, `PUSH_PRIVATE_KEY`, `PUSH_PUBLIC_KEY`
3. Generate VAPID keys: `npm run generate-vapid-keys`
4. `npm install && npm start`

## Git Submodule Workflow

- All work on client/server code happens on branches in the **original repositories**
- The monorepo tracks specific commits of each submodule
- To update submodules: `git submodule update --remote`
- After cloning: `git clone --recurse-submodules <monorepo-url>`

## AI / Claude Code

This monorepo is structured to provide Claude Code with full context across both projects. The hierarchy for Claude Code configuration:
- **Root `CLAUDE.md`** (this file): overall project context, shared conventions
- **`client/CLAUDE.md`**: client-specific patterns, components, conventions
- **`server/CLAUDE.md`**: server-specific patterns, API routes, models

See [`TOOLS.md`](TOOLS.md) for the full list of AI development tools used in this project (nWave, RTK, GitNexus, Tessl, ccusage, Entire).