# Contributor guide

Short path from a clean clone to a working local War Room. Day-1 checklist: [ONBOARDING.md](./ONBOARDING.md). Deep product notes live in the root [README](../README.md).

## Prerequisites

- Node.js 22+ (matches CI)
- Docker Desktop (or compatible engine) for PostgreSQL and Redis
- Optional: a Temporal server on `127.0.0.1:7233` if you enable durable workflows

## First-time setup

```bash
npm install
cp .env.example .env
npm run doctor
npm run infra:up
npm run db:migrate
```

Keep real provider secrets in `.env` only (gitignored). Default LLM mode is `mock` — no paid API keys required for local demos or most tests.

## Everyday workflow

Two terminals:

```bash
npm run dev:api
npm run dev:web
```

Defaults:

| Service | URL |
| --- | --- |
| API | `http://127.0.0.1:3000` |
| Web | `http://127.0.0.1:5173` |

Local auth (`AUTH_PROVIDER=headers`) sends:

- `x-user-id: user_local`
- `x-workspace-id: local_workspace`

Expected happy path in the UI:

1. Submit a raw idea.
2. Review Shield + triage on Human Review.
3. Execute the run and watch stream events.
4. Open Executive Summary, PRD, and Development Prompt.

## Runtime flags (common)

Copy from `.env.example`. Flags most contributors touch:

| Flag | Default | Notes |
| --- | --- | --- |
| `LLM_PRIMARY_PROVIDER` / `LLM_FALLBACK_PROVIDER` | `mock` | Keep mock unless you explicitly opt into real providers. |
| `LLM_ALLOW_REAL_PROVIDERS` | `false` | Required outside production when any `LLM_*_PROVIDER` is not `mock`. |
| `AUTH_PROVIDER` | `headers` | `bearer` / `session` / `external` for auth rollouts. |
| `TEMPORAL_ENABLED` | `false` | Set `true` only with a reachable Temporal server + worker. |
| `VITE_USE_TEMPORAL_WORKFLOWS` | `auto` | Follows API Temporal capability; force with `true` / `false`. |
| `STRIPE_ENABLED` | `false` | Leave off unless testing billing. |
| `RESEARCH_PROVIDER` | `mock` | Real research needs an explicit provider + key. |
| `APP_ENCRYPTION_KEY` | local placeholder | Required for BYOK / sessions; never reuse the default in production. |

Temporal local path (after a Temporal server is up):

```bash
TEMPORAL_ENABLED=true npm run dev:api
npm run worker:temporal:dev
VITE_USE_TEMPORAL_WORKFLOWS=true npm run dev:web
```

Custom ports must keep CORS aligned (`WEB_ORIGIN` ↔ `VITE_API_URL`). See README “Docker Deployment”.

## Verification commands

| Command | When |
| --- | --- |
| `npm run doctor` | Day-1 env check (Node, `.env`, Postgres, Redis, API port). |
| `npm run quality:gate` | Pre-push / PR baseline (build, lint, typecheck, API gate, audit, compose config). |
| `npm run quality:infra` | Bring up Docker deps and apply migrations. |
| `npm run test` | Workspace unit/integration tests. |
| `npm run test:e2e` | Playwright happy path (`npm run test:e2e:install` once). |
| `RUN_LOAD_TESTS=1 npm run test:load` | Opt-in Redis/PG write-pressure + concurrent stream lag probe (not part of `quality:gate`). |
| `npm run db:migrate -- --status` | List applied vs pending migrations without writing. |

## Package map

| Path | Role |
| --- | --- |
| `apps/web` | Vite React UI |
| `apps/api` | NestJS Fastify API + Temporal worker entrypoints |
| `packages/schemas` | Shared Zod contracts |
| `packages/web-blocks` | Shared UI helpers (e.g. abortable loaders) |

## Conventions

- Prefer additive SQL migrations; preview with `--status` / `--dry-run` before applying.
- Do not commit `.env`, provider keys, or local planning files (`*.local.md`).
- Treat user input as untrusted; Shield stays a background security layer, not a visible council agent.
- When changing stream/event shapes, update `@ai-war-room/schemas` and keep API/web consumers in sync.

## Where to dig deeper

- Auth, billing, Temporal, Shield, and readiness endpoints — root README sections.
- Locked product policies — [PRODUCT_POLICIES.md](./PRODUCT_POLICIES.md).
- Operator deploy / incident checklist — [OPERATOR.md](./OPERATOR.md).
- Artifact / billing developer contracts — [ARTIFACTS_AND_BILLING.md](./ARTIFACTS_AND_BILLING.md).
