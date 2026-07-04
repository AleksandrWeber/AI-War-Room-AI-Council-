# AI War Room / AI Council

Structured AI planning engine that turns a raw idea into reviewed, build-ready artifacts.

## Current MVP Flow

```text
Idea submission
-> Shield input scan
-> Deterministic triage
-> Human Review Screen
-> Mock isolated agents
-> Mock Moderator synthesis
-> Executive Summary, PRD, Development Prompt
```

## Workspace Layout

- `apps/web` - Vite React frontend.
- `apps/api` - NestJS Fastify API.
- `packages/schemas` - shared Zod contracts.

## Local Setup

Install dependencies:

```bash
npm install
```

Start PostgreSQL and Redis:

```bash
npm run infra:up
```

Apply database migrations:

```bash
npm run db:migrate
```

Start the API:

```bash
npm run dev:api
```

Start the web app:

```bash
npm run dev:web
```

## Verification

```bash
npm run build
npm run lint
npm run typecheck
npm run test
npm audit --omit=dev
docker compose config
```

## Persistence

Local persistence uses:

- PostgreSQL for runs, Shield scans, idempotency records, agent outputs, moderator synthesis, and artifacts.
- Redis for fast idempotency reservation.

Tests use an in-memory repository so they do not require Docker.

