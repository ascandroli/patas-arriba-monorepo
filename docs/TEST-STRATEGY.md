# Test Strategy — Patas Arriba

## Audit Results (2026-03-30)

### Current State

| Area | Test Files | Framework | Coverage | Test Script |
|------|-----------|-----------|----------|-------------|
| Client | 0 | None | 0% | None |
| Server | 0 | None | 0% | None |

**No tests exist in either project.** Both repositories have zero test infrastructure.

### Server — Critical Paths Identified

| Priority | Area | Files | Why |
|----------|------|-------|-----|
| 1 | Auth middleware | `middleware/auth.middleware.js` | Guards every authenticated route |
| 2 | Auth routes | `routes/auth.routes.js` | Signup, login, token verify — security critical |
| 3 | Event routes | `routes/event.routes.js` | Largest route file, core business logic |
| 4 | Car-group routes | `routes/car-group.routes.js` | Complex carpool coordination logic |
| 5 | Attendee routes | `routes/attendee.routes.js` | Event participation management |
| 6 | User routes | `routes/user.routes.js` | Profile management |
| 7 | Message routes | `routes/message.routes.js` | User-to-user messaging |
| 8 | Push subscriptions | `routes/pushsubscription.routes.js` | Notification subscriptions |
| 9 | Models (7 total) | `models/*.model.js` | Schema validation and constraints |

### Client — Critical Paths Identified

| Priority | Area | Why |
|----------|------|-----|
| 1 | AuthContext | Login/logout/token lifecycle |
| 2 | Route guards | OnlyPrivate, OnlyAnon, role-based access (OnlyOrganizerOrAdmin) |
| 3 | API service layer | Axios instance, JWT interceptor |
| 4 | Event components | Core feature — create, view, manage events |
| 5 | Car-group components | Complex UI logic for carpool management |

## Decision: Three-Layer Testing Strategy

### Layer 1 — Server: Unit & Integration Tests

- **Scope**: API routes, middleware, models
- **Framework**: TBD (candidates: Vitest, Jest, Mocha+Chai, Node.js built-in `node:test`)
- **HTTP testing**: Supertest
- **Database**: Real test MongoDB instance (no mocks)
- **Priority**: Auth middleware > Auth routes > Event routes > Models

### Layer 2 — Client: Component & Integration Tests

- **Scope**: React components, hooks, context providers, route guards
- **Framework**: TBD (candidates: Vitest, Jest) + React Testing Library
- **Environment**: jsdom (simulated DOM, no real browser needed)
- **Priority**: AuthContext > Route guards > API service layer > Core feature components

### Layer 3 — E2E: Full User Journeys (Playwright)

- **Scope**: Real browser testing across client + server together
- **Framework**: Playwright
- **Location**: Monorepo root (spans both projects)
- **Environment**: Dev containers (Docker Compose)
- **Priority**: Signup/login flow > Event lifecycle > Carpool coordination
- **Screen specs**: Each screen documented in `docs/screens/` as a markdown file describing expected elements, interactions, and behavior — serves as both documentation and test specification

## Implementation Order

1. **Playwright E2E** (starting first) — highest confidence, tests the real stack
2. **Server unit/integration tests** — protect the API layer
3. **Client component tests** — protect the UI layer

## Supporting Documentation

- `docs/PRD.md` — Product Requirements Document (overall features and flows)
- `docs/screens/*.md` — Per-screen specifications (expected elements, interactions, edge cases)