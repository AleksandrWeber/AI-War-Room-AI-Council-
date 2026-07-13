# AI War Room / AI Council

Structured AI planning engine that turns a raw idea into reviewed, build-ready artifacts.

## Current MVP Flow

```text
Idea submission
-> Shield input scan
-> Prompt-driven triage through LLM Gateway
-> Human Review Screen
-> Prompt-driven isolated agents through LLM Gateway
-> Prompt-driven Moderator synthesis through LLM Gateway
-> Prompt-driven Executive Summary, PRD, Development Prompt
```

## Workspace Layout

- `apps/web` - Vite React frontend.
- `apps/api` - NestJS Fastify API.
- `packages/schemas` - shared Zod contracts.

## Local Setup

Contributor quickstart (setup, flags, quality commands): [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md).  
Operator deploy / migrations / incidents: [docs/OPERATOR.md](docs/OPERATOR.md).  
Artifacts, export, and billing/usage contracts: [docs/ARTIFACTS_AND_BILLING.md](docs/ARTIFACTS_AND_BILLING.md).

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

Preview applied vs pending migrations without writing:

```bash
npm run db:migrate -- --status
```

Migration safety and rollback:

- Each migration file runs in its own transaction (`BEGIN` / `COMMIT`, with `ROLLBACK` on failure).
- Migrations are forward-only. There are no automatic down migrations.
- Before production apply, run `npm run db:migrate -- --status` (or `--dry-run`) and confirm the pending set.
- To roll back a bad production change: restore PostgreSQL from a known-good backup taken before the migration, redeploy the previous app revision, and do **not** manually delete rows from `schema_migrations` unless you are restoring that backup consistently.
- Prefer additive migrations (`CREATE INDEX IF NOT EXISTS`, new nullable columns, new tables). Avoid destructive `DROP`/`TRUNCATE` in the same release as the app code that still depends on the old shape.

Start the API:

```bash
npm run dev:api
```

Start the web app:

```bash
npm run dev:web
```

Default local ports are:

- API: `http://127.0.0.1:3000`
- Web: `http://127.0.0.1:5173`

## Docker Deployment

Build the production API and web images:

```bash
npm run docker:build
```

Start the API with PostgreSQL and Redis:

```bash
npm run docker:up:stack
```

The API container runs database migrations on startup, then serves on port `3000`.

Start the full production stack including the nginx web container:

```bash
npm run docker:up:full
```

The web container serves the Vite build on port `8080` and proxies `/api` to the API service, so the browser uses same-origin requests without extra CORS configuration.

Readiness checks:

- `GET /api/health` — lightweight liveness probe.
- `GET /api/health/ready` — returns `200` only when PostgreSQL and Redis are reachable; otherwise `503` with dependency details.

To include the Temporal worker profile (requires a Temporal server reachable at `host.docker.internal:7233`):

```bash
npm run docker:up:temporal
```

This starts postgres, redis, api, web, and the temporal worker.

Required production environment variables for the API container:

- `DATABASE_URL`
- `REDIS_URL`
- `APP_ENCRYPTION_KEY`
- `WEB_ORIGIN`

If you run custom ports, keep API CORS and web API URL aligned:

```bash
API_PORT=3006 WEB_ORIGIN=http://127.0.0.1:5175 npm run dev:api
VITE_API_URL=http://127.0.0.1:3006/api npm run dev --workspace @ai-war-room/web -- --host 127.0.0.1 --port 5175
```

## Verification

```bash
npm run quality:gate
```

`quality:gate` now runs the API reliability gate (`test:gate`) with retry-aware checks.
You can tune the API test duration budget with `API_TEST_MAX_MS`:

```bash
API_TEST_MAX_MS=90000 npm run test:gate --workspace @ai-war-room/api
```

Run the local persistence gate:

```bash
npm run quality:infra
```

Opt-in Redis stream + PostgreSQL write-pressure load probe (not part of `quality:gate`):

```bash
RUN_LOAD_TESTS=1 npm run test:load
```

## MVP Demo Checklist

1. Start infrastructure:

```bash
npm run infra:up
npm run db:migrate
```

2. Start API and web app in separate terminals:

```bash
npm run dev:api
npm run dev:web
```

3. Open the Vite app and verify:

- API status becomes `online`.
- Submit a raw idea.
- Review Shield and triage metadata.
- Edit selected agents if needed.
- Execute the prompt-driven pipeline and watch live status events.
- Confirm agent summaries and three artifacts appear: Executive Summary, PRD, Development Prompt.

## Persistence

Local persistence uses:

- PostgreSQL for runs, Shield scans, idempotency records, agent outputs, moderator synthesis, and artifacts.
- PostgreSQL for local users, workspaces, and workspace memberships.
- PostgreSQL for usage events, workspace usage limits, and Stripe-ready billing records.
- Redis for fast idempotency reservation.

Tests use an in-memory repository so they do not require Docker.

## Auth And Workspaces

Auth provider modes are configured on the API:

- `AUTH_PROVIDER=headers` (default) — local development uses workspace headers only.
- `AUTH_PROVIDER=bearer` — protected routes also require `Authorization: Bearer <AUTH_BEARER_TOKEN>`.
- `AUTH_PROVIDER=session` — protected routes require a signed session token from `POST /api/auth/session`.

Discover the active mode from `GET /api/auth/capabilities`.

Local development headers:

- `x-user-id: user_local`
- `x-workspace-id: local_workspace`

Bootstrap a signed session:

```bash
curl -X POST http://127.0.0.1:3000/api/auth/session \
  -H 'content-type: application/json' \
  -H 'x-user-id: user_local' \
  -H 'x-workspace-id: local_workspace' \
  -d '{"workspaceId":"local_workspace"}'
```

For bearer or session rollout, set matching tokens on the API and web build:

```bash
AUTH_PROVIDER=bearer AUTH_BEARER_TOKEN=change-me npm run dev:api
VITE_AUTH_BEARER_TOKEN=change-me npm run dev:web

AUTH_PROVIDER=session AUTH_BEARER_TOKEN=change-me npm run dev:api
VITE_AUTH_BEARER_TOKEN=change-me npm run dev:web
```

In session mode the frontend bootstraps and stores the signed token in local storage automatically.

External provider rollout:

```bash
AUTH_PROVIDER=external \
AUTH_EXTERNAL_VENDOR=clerk \
AUTH_EXTERNAL_ADAPTER=mock \
AUTH_EXTERNAL_JWT_SECRET=change-me \
npm run dev:api

VITE_AUTH_EXTERNAL_TOKEN=<mock-or-provider-token> npm run dev:web
```

For production Clerk or Auth0, switch `AUTH_EXTERNAL_ADAPTER=jwks` and configure `AUTH_EXTERNAL_JWKS_URL`, `AUTH_EXTERNAL_ISSUER`, and `AUTH_EXTERNAL_AUDIENCE`.

External users can be provisioned automatically when `AUTH_EXTERNAL_AUTO_PROVISION=true`, or explicitly through `POST /api/auth/provision`.

Auth rollout readiness:

- `GET /api/auth/readiness` returns operator-facing production auth checklist results (`ready` or `not_ready`).
- Checks cover auth provider mode, bearer bootstrap token, encryption key, HTTPS web origin, and external JWKS or mock config.
- Production startup rejects header auth, external mock adapter, and missing bearer bootstrap tokens.
- The web billing panel shows auth rollout status and per-check guidance.

## Billing

Billing checkout is disabled by default. Discover the active mode from `GET /api/billing/capabilities`.

Mock billing rollout for local development:

```bash
STRIPE_ENABLED=true STRIPE_BILLING_ADAPTER=mock npm run dev:api
```

Create a checkout session:

```bash
curl -X POST http://127.0.0.1:3000/api/billing/checkout-session \
  -H 'content-type: application/json' \
  -H 'x-user-id: user_local' \
  -H 'x-workspace-id: local_workspace' \
  -d '{"workspaceId":"local_workspace","paidTier":"pro"}'
```

Open the returned `checkoutUrl` to complete mock billing locally.

Production Stripe rollout:

```bash
STRIPE_ENABLED=true \
STRIPE_BILLING_ADAPTER=stripe \
STRIPE_SECRET_KEY=sk_live_... \
STRIPE_WEBHOOK_SECRET=whsec_... \
STRIPE_PRICE_ID_PRO=price_... \
STRIPE_PRICE_ID_BUSINESS=price_... \
npm run dev:api
```

Configure Stripe webhooks to `POST /api/billing/webhook`. Checkout metadata includes `workspaceId` and `paidTier` so subscription events upgrade workspace limits automatically.

### Billing UI

The web app includes a **Workspace Billing** panel (`#billing`) that:

- loads billing capabilities and workspace billing status from the API
- shows Free / Pro / Business tier cards with daily limits
- starts checkout for Pro or Business when `STRIPE_ENABLED=true`
- completes mock checkout inline in the browser
- refreshes status after Stripe returns to `/billing/success` or `/billing/cancel`

Local mock billing UI test:

```bash
STRIPE_ENABLED=true STRIPE_BILLING_ADAPTER=mock npm run dev:api
npm run dev:web
```

Open the web app, scroll to **Workspace Billing**, and click **Upgrade to Pro**.

Customer portal:

```bash
curl -X POST http://127.0.0.1:3000/api/billing/customer-portal-session \
  -H 'content-type: application/json' \
  -H 'x-user-id: user_local' \
  -H 'x-workspace-id: local_workspace' \
  -d '{"workspaceId":"local_workspace"}'
```

In the web app, use **Manage subscription** after checkout. Mock mode opens an inline portal with cancel support; Stripe mode redirects to the hosted Billing Portal and returns via `/billing/portal`.

Configure `STRIPE_PORTAL_RETURN_URL` for production return navigation.

Webhook hardening:

- `POST /api/billing/webhook` processes Stripe or mock events idempotently by external event id.
- Duplicate deliveries return `{ duplicate: true }` without re-applying tier changes.
- `GET /api/billing/workspace/:workspaceId/webhook-events` returns recent audit events for the workspace.
- The API enables raw request bodies for Stripe signature verification.

Invoice history:

- `GET /api/billing/workspace/:workspaceId/invoices` returns workspace invoice records.
- Checkout and webhook flows upsert invoices with amount, status, tier, and hosted invoice URLs.
- Mock tier amounts: Pro `$29`, Business `$99`.

Usage summary:

- `GET /api/billing/workspace/:workspaceId/usage` returns daily token and estimated cost totals against workspace tier limits.
- Usage totals are computed from `usage_events` for the current UTC day.
- The web billing panel shows token and cost progress meters for the active billing period.

Billing export:

- `GET /api/billing/workspace/:workspaceId/invoices/export?format=csv|json` downloads workspace invoice history.
- CSV export includes invoice ids, amounts, status, tier, and hosted invoice links.
- The web billing panel exposes **Export CSV** and **Export JSON** actions.

Billing alerts:

- `GET /api/billing/workspace/:workspaceId/alerts` returns usage and billing status alerts for the workspace.
- Alerts fire at 80% daily token/cost usage (warning) and 100% (critical), plus `past_due` and `canceled` subscription states.
- The web billing panel shows severity-styled alerts above billing status cards.

Metered usage reporting:

- Pipeline runs report token usage for active paid workspaces through mock or Stripe subscription item usage records.
- `GET /api/billing/workspace/:workspaceId/meter-usage-reports` returns recent metered usage report history.
- Mock billing enables metered usage automatically; Stripe requires `STRIPE_METERED_USAGE_ENABLED=true` and `STRIPE_METER_EVENT_NAME`.

Billing notification delivery:

- `GET /api/billing/workspace/:workspaceId/notifications` syncs active billing alerts and returns delivery history.
- Notifications deliver once per alert id through mock or email-stub adapters (`BILLING_NOTIFICATION_ADAPTER`).
- Webhooks, pipeline runs, and notification reads trigger delivery sync for usage and billing status alerts.

Billing rollout readiness:

- `GET /api/billing/readiness` returns operator-facing Stripe production checklist results (`ready`, `not_ready`, or `disabled`).
- Checks cover billing adapter, Stripe credentials, price ids, HTTPS checkout URLs, metered usage config, and notification delivery.
- Production startup rejects `STRIPE_BILLING_ADAPTER=mock` when `NODE_ENV=production` and billing is enabled.
- Copy `.env.production.billing.example` for Docker Compose production billing env wiring.
- The web billing panel shows rollout status and per-check guidance.

Billing admin tools:

- `GET /api/billing/workspace/:workspaceId/admin` returns owner/admin billing health metrics and available actions.
- `POST /api/billing/workspace/:workspaceId/admin/actions` runs workspace billing admin actions such as notification sync and mock billing reset.
- Only workspace owners and admins can access billing admin endpoints.
- The web billing panel shows billing admin stats and action buttons for authorized roles.

Usage admin tools:

- `GET /api/usage/workspace/:workspaceId/admin` returns owner/admin daily usage metrics and quota utilization.
- `POST /api/usage/workspace/:workspaceId/admin/actions` runs usage admin actions such as reset daily usage for local testing.
- Only workspace owners and admins can access usage admin endpoints.
- The web billing panel shows usage admin stats and reset actions for authorized roles.

Workspace member admin tools:

- `GET /api/workspaces/:workspaceId/admin/members` returns owner/admin workspace member roster and role stats.
- `POST /api/workspaces/:workspaceId/admin/members/actions` runs member admin actions such as role updates, removals, and local test member adds.
- Only workspace owners and admins can access workspace member admin endpoints.
- The web billing panel shows member roster and role management actions for authorized roles.
- `GET /api/workspaces/:workspaceId/admin/audit/export?format=csv|json` downloads workspace audit records for owners and admins.
- Audit export includes usage events, billing webhook events, billing notifications, and meter usage reports.
- The web billing panel exposes **Export audit CSV** and **Export audit JSON** actions for authorized roles.

Run mutation endpoints verify that the request workspace matches the header workspace and that the user is a workspace member.

## Research Provider

Market Research Agent uses an external research provider abstraction.

Research rollout readiness:

- `GET /api/research/readiness` returns operator-facing production research checklist results (`ready` or `not_ready`).
- Checks cover research provider selection, Tavily API key, and Tavily max results.
- Production startup rejects `RESEARCH_PROVIDER=mock`.
- The web billing panel shows research rollout status and per-check guidance.

## LLM Gateway

The API contains an internal LLM gateway abstraction for structured JSON calls.

LLM rollout readiness:

- `GET /api/llm/readiness` returns operator-facing production LLM checklist results (`ready` or `not_ready`).
- Checks cover primary/fallback providers, model names, and provider API keys.
- Production startup rejects `LLM_PRIMARY_PROVIDER=mock`.
- The web billing panel shows LLM rollout status and per-check guidance.

## Temporal Workflows

Durable run execution can route through Temporal when enabled.

Workspace settings admin tools:

- `GET /api/workspaces/:workspaceId/admin/settings` returns owner/admin workspace settings summary.
- `POST /api/workspaces/:workspaceId/admin/settings/actions` runs settings admin actions such as workspace renames and local reset.
- Only workspace owners and admins can access workspace settings admin endpoints.
- The web billing panel shows workspace settings admin tools for authorized roles.

Temporal rollout readiness:

- `GET /api/runs/temporal/readiness` returns operator-facing production Temporal checklist results (`ready`, `not_ready`, or `disabled`).
- Checks cover Temporal address, namespace, task queue, stream config, server reachability, and worker heartbeat.
- Production startup rejects local Temporal addresses when `TEMPORAL_ENABLED=true`.
- The web billing panel shows Temporal rollout status and per-check guidance.

Model router rollout readiness:

- `GET /api/model-router/readiness` returns operator-facing production model router checklist results (`ready` or `not_ready`).
- Checks cover registry population, primary/fallback provider models, champion/deputy coverage, and route alignment.
- The web billing panel shows model router rollout status and per-check guidance.

Workspace model health admin tools:

- `GET /api/model-router/workspace/:workspaceId/admin` returns owner/admin model registry health summary.
- `POST /api/model-router/workspace/:workspaceId/admin/actions` runs model health admin actions such as degraded model recovery.
- `POST /api/model-router/registry/:modelId/recover` requires workspace owner/admin access.
- Only workspace owners and admins can access model health admin endpoints.
- The web billing panel shows model health admin tools for authorized roles.

Shield rollout readiness:

- `GET /api/shield/readiness` returns operator-facing production Shield checklist results (`ready` or `not_ready`).
- Checks cover classifier configuration, false-positive review regression, production false-positive budget, and adversarial dataset coverage.
- The web billing panel shows Shield rollout status and per-check guidance.

Workspace Shield review admin tools:

- `GET /api/shield/workspace/:workspaceId/admin` returns owner/admin Shield review summary.
- `POST /api/shield/workspace/:workspaceId/admin/actions` runs Shield review admin actions such as rerunning the false-positive review set.
- `GET /api/shield/review-summary` requires workspace owner/admin access.
- Only workspace owners and admins can access Shield review admin endpoints.
- The web billing panel shows Shield review admin tools for authorized roles.

Provider credentials rollout readiness:

- `GET /api/provider-credentials/readiness` returns operator-facing production provider credential checklist results (`ready` or `not_ready`).
- Checks cover encryption key configuration, encryption roundtrip, PostgreSQL persistence, and active LLM provider system keys.
- Platform readiness requires env system keys (`ANTHROPIC_API_KEY` / `OPENAI_API_KEY`) when those providers are active. Workspace BYOK is a per-workspace override and is not a substitute for those checks.
- Rotate a workspace provider key by re-saving it through the provider-credentials API (`PUT`); plaintext is never returned after save.
- Changing `APP_ENCRYPTION_KEY` without a re-encrypt migration orphans existing BYOK ciphertext and also invalidates signed auth sessions. There is no dual-key rotation path yet.
- Production startup rejects the default `APP_ENCRYPTION_KEY`.
- The web billing panel shows provider credentials rollout status and per-check guidance.

Workspace provider key admin tools:

- `GET /api/provider-credentials/workspace/:workspaceId/admin` returns owner/admin workspace provider key summary.
- `POST /api/provider-credentials/workspace/:workspaceId/admin/actions` runs provider key admin actions such as testing all credentials or retesting failed credentials.
- Only workspace owners and admins can access provider key admin endpoints.
- The web billing panel shows provider key admin tools for authorized roles.

Observability rollout readiness:

- `GET /api/observability/readiness` returns operator-facing production observability checklist results (`ready` or `not_ready`).
- Checks cover structured logging, tracing spans, recent event buffer capacity, and pipeline event coverage.
- The web billing panel shows observability rollout status and per-check guidance.

Workspace observability admin tools:

- `GET /api/observability/workspace/:workspaceId/admin` returns owner/admin workspace observability summary.
- `POST /api/observability/workspace/:workspaceId/admin/actions` runs observability admin actions such as refreshing event summaries or clearing the local event buffer.
- Only workspace owners and admins can access observability admin endpoints.
- The web billing panel shows observability admin tools for authorized roles.

Prompt evaluation rollout readiness:

- `GET /api/evaluation/readiness` returns operator-facing production prompt evaluation checklist results (`ready` or `not_ready`).
- Checks cover regression dataset coverage, schema validity, prompt version drift, and production regression budget.
- The web billing panel shows prompt evaluation rollout status and per-check guidance.

Workspace prompt regression admin tools:

- `GET /api/evaluation/workspace/:workspaceId/admin` returns owner/admin prompt regression summary.
- `POST /api/evaluation/workspace/:workspaceId/admin/actions` runs prompt regression admin actions such as rerunning the evaluation suite.
- Only workspace owners and admins can access prompt regression admin endpoints.
- The web billing panel shows prompt regression admin tools for authorized roles.

Run history rollout readiness:

- `GET /api/runs/history/readiness` returns operator-facing production run history checklist results (`ready` or `not_ready`).
- Checks cover artifact persistence, markdown export, stream replay buffer, and critical artifact type coverage.
- The web billing panel shows run history rollout status and per-check guidance.

Workspace run history admin tools:

- `GET /api/runs/history/workspace/:workspaceId/admin` returns owner/admin run history summary.
- `GET /api/runs/history/workspace/:workspaceId/admin/export?format=csv|json` exports workspace run history records.
- `POST /api/runs/history/workspace/:workspaceId/admin/actions` runs run history admin actions such as refreshing the summary.
- Only workspace owners and admins can access run history admin endpoints.
- The web billing panel shows run history admin tools for authorized roles.

Stream replay rollout readiness:

- `GET /api/runs/stream/readiness` returns operator-facing production SSE stream replay checklist results (`ready` or `not_ready`).
- Checks cover Redis-backed buffers, connectivity, Last-Event-ID replay, full replay, and critical stream event coverage.
- The web billing panel shows stream replay rollout status and per-check guidance.

Workspace stream recovery admin tools:

- `GET /api/runs/stream/workspace/:workspaceId/admin` returns owner/admin buffered stream summary.
- `POST /api/runs/stream/workspace/:workspaceId/admin/actions` runs stream recovery admin actions such as refreshing summaries or clearing workspace stream buffers.
- Only workspace owners and admins can access stream recovery admin endpoints.
- The web billing panel shows stream recovery admin tools for authorized roles.

Idempotency rollout readiness:

- `GET /api/idempotency/readiness` returns operator-facing production idempotency checklist results (`ready` or `not_ready`).
- Checks cover Redis reservations, connectivity, persisted idempotency keys, reservation TTL, and duplicate request protection.
- The web billing panel shows idempotency rollout status and per-check guidance.

Workspace idempotency admin tools:

- `GET /api/idempotency/workspace/:workspaceId/admin` returns owner/admin idempotency summary.
- `POST /api/idempotency/workspace/:workspaceId/admin/actions` runs idempotency admin actions such as refreshing summaries or clearing workspace reservations.
- Only workspace owners and admins can access idempotency admin endpoints.
- The web billing panel shows idempotency admin tools for authorized roles.

Usage limits rollout readiness:

- `GET /api/usage/limits/readiness` returns operator-facing production usage limits checklist results (`ready` or `not_ready`).
- Checks cover persisted limits, daily cost quota enforcement, token tracking, and tier configuration.
- The web billing panel shows usage limits rollout status and per-check guidance.

Workspace quota admin tools:

- `GET /api/usage/limits/workspace/:workspaceId/admin` returns owner/admin quota summary with recent usage events.
- `POST /api/usage/limits/workspace/:workspaceId/admin/actions` runs quota admin actions such as refreshing the summary.
- Only workspace owners and admins can access quota admin endpoints.
- The web billing panel shows quota admin tools for authorized roles.

Deployment health rollout readiness:

- `GET /api/deployment/readiness` returns operator-facing production deployment checklist results (`ready` or `not_ready`).
- Checks cover API health, readiness probes, dependency health, and production web origin configuration.
- The web billing panel shows deployment health rollout status and per-check guidance.

Workspace deployment admin tools:

- `GET /api/deployment/workspace/:workspaceId/admin` returns owner/admin deployment health summary.
- `POST /api/deployment/workspace/:workspaceId/admin/actions` runs deployment admin actions such as refreshing the summary.
- Only workspace owners and admins can access deployment admin endpoints.
- The web billing panel shows deployment admin tools for authorized roles.

Database migration rollout readiness:

- `GET /api/migrations/readiness` returns operator-facing production database migration checklist results (`ready` or `not_ready`).
- Checks cover PostgreSQL connectivity, schema_migrations table, migration file inventory, and pending migration coverage.
- CLI: `npm run db:migrate -- --status` lists applied vs pending migrations without applying.
- Migrations are forward-only and transactional per file; production rollback is restore-from-backup plus app redeploy (see README migration safety section).
- The web billing panel shows migration rollout status and per-check guidance.

Workspace migration admin tools:

- `GET /api/migrations/workspace/:workspaceId/admin` returns owner/admin migration summary with applied and pending SQL migrations.
- `POST /api/migrations/workspace/:workspaceId/admin/actions` runs migration admin actions such as refreshing the summary.
- Only workspace owners and admins can access migration admin endpoints.
- The web billing panel shows migration admin tools for authorized roles.

Production backup rollout readiness:

- `GET /api/backup/readiness` returns operator-facing production backup checklist results (`ready` or `not_ready`).
- Checks cover PostgreSQL connectivity, Redis persistence, critical table coverage, migration prerequisites, and restore readiness signals.
- The web billing panel shows backup rollout status and per-check guidance.

Workspace backup admin tools:

- `GET /api/backup/workspace/:workspaceId/admin` returns owner/admin backup summary with recoverable workspace data domains.
- `POST /api/backup/workspace/:workspaceId/admin/actions` runs backup admin actions such as refreshing the summary.
- Only workspace owners and admins can access backup admin endpoints.
- The web billing panel shows backup admin tools for authorized roles.

Production audit trail rollout readiness:

- `GET /api/audit/readiness` returns operator-facing production audit trail checklist results (`ready` or `not_ready`).
- Checks cover PostgreSQL connectivity, persistent audit table coverage, workspace audit export support, and retention readiness signals.
- The web billing panel shows audit trail rollout status and per-check guidance.

Workspace audit trail admin tools:

- `GET /api/audit/workspace/:workspaceId/admin` returns owner/admin audit summary with recoverable workspace audit domains.
- `POST /api/audit/workspace/:workspaceId/admin/actions` runs audit admin actions such as refreshing the summary.
- Only workspace owners and admins can access audit trail admin endpoints.
- The web billing panel shows audit trail admin tools for authorized roles.

Production compliance rollout readiness:

- `GET /api/compliance/readiness` returns operator-facing production compliance checklist results (`ready` or `not_ready`).
- Checks cover PostgreSQL connectivity, policy table coverage, encryption key readiness, workspace role governance, and attestation readiness signals.
- The web billing panel shows compliance rollout status and per-check guidance.

Workspace compliance admin tools:

- `GET /api/compliance/workspace/:workspaceId/admin` returns owner/admin compliance summary with workspace policy attestation domains.
- `POST /api/compliance/workspace/:workspaceId/admin/actions` runs compliance admin actions such as refreshing the summary.
- Only workspace owners and admins can access compliance admin endpoints.
- The web billing panel shows compliance admin tools for authorized roles.

Production incident response rollout readiness:

- `GET /api/incidents/readiness` returns operator-facing production incident response checklist results (`ready` or `not_ready`).
- Checks cover PostgreSQL connectivity, incident signal table coverage, billing alert escalation, observability incident buffers, and escalation readiness signals.
- The web billing panel shows incident response rollout status and per-check guidance.

Workspace incident admin tools:

- `GET /api/incidents/workspace/:workspaceId/admin` returns owner/admin incident summary with workspace incident domains.
- `POST /api/incidents/workspace/:workspaceId/admin/actions` runs incident admin actions such as refreshing the summary.
- Only workspace owners and admins can access incident admin endpoints.
- The web billing panel shows incident admin tools for authorized roles.

Production release rollout readiness:

- `GET /api/releases/readiness` returns operator-facing production release checklist results (`ready` or `not_ready`).
- Checks cover PostgreSQL connectivity, release artifact table coverage, API version metadata, migration prerequisites, and rollout readiness signals.
- The web billing panel shows release rollout status and per-check guidance.

Workspace release admin tools:

- `GET /api/releases/workspace/:workspaceId/admin` returns owner/admin release summary with workspace release artifact domains.
- `POST /api/releases/workspace/:workspaceId/admin/actions` runs release admin actions such as refreshing the summary.
- Only workspace owners and admins can access release admin endpoints.
- The web billing panel shows release admin tools for authorized roles.

Production SLO rollout readiness:

- `GET /api/slo/readiness` returns operator-facing production SLO checklist results (`ready` or `not_ready`).
- Checks cover PostgreSQL connectivity, SLO signal table coverage, observability SLO buffer capacity, model health SLO signals, and target readiness signals.
- The web billing panel shows SLO rollout status and per-check guidance.

Workspace SLO admin tools:

- `GET /api/slo/workspace/:workspaceId/admin` returns owner/admin SLO summary with workspace SLO signal domains.
- `POST /api/slo/workspace/:workspaceId/admin/actions` runs SLO admin actions such as refreshing the summary.
- Only workspace owners and admins can access SLO admin endpoints.
- The web billing panel shows SLO admin tools for authorized roles.

Production capacity rollout readiness:

- `GET /api/capacity/readiness` returns operator-facing production capacity checklist results (`ready` or `not_ready`).
- Checks cover PostgreSQL connectivity, capacity signal table coverage, Redis capacity signals, usage limits capacity enforcement, and scaling readiness signals.
- The web billing panel shows capacity rollout status and per-check guidance.

Workspace capacity admin tools:

- `GET /api/capacity/workspace/:workspaceId/admin` returns owner/admin capacity summary with workspace capacity signal domains.
- `POST /api/capacity/workspace/:workspaceId/admin/actions` runs capacity admin actions such as refreshing the summary.
- Only workspace owners and admins can access capacity admin endpoints.
- The web billing panel shows capacity admin tools for authorized roles.

Production performance rollout readiness:

- `GET /api/performance/readiness` returns operator-facing production performance checklist results (`ready` or `not_ready`).
- Checks cover PostgreSQL connectivity, performance signal table coverage, observability performance buffer capacity, tracing latency signals, and latency readiness signals.
- The web billing panel shows performance rollout status and per-check guidance.

Workspace performance admin tools:

- `GET /api/performance/workspace/:workspaceId/admin` returns owner/admin performance summary with workspace performance signal domains.
- `POST /api/performance/workspace/:workspaceId/admin/actions` runs performance admin actions such as refreshing the summary.
- Only workspace owners and admins can access performance admin endpoints.
- The web billing panel shows performance admin tools for authorized roles.

Production resilience rollout readiness:

- `GET /api/resilience/readiness` returns operator-facing production resilience checklist results (`ready` or `not_ready`).
- Checks cover PostgreSQL connectivity, resilience signal table coverage, Redis recovery signals, migration recovery prerequisites, and recovery readiness signals.
- The web billing panel shows resilience rollout status and per-check guidance.

Workspace resilience admin tools:

- `GET /api/resilience/workspace/:workspaceId/admin` returns owner/admin resilience summary with workspace recovery signal domains.
- `POST /api/resilience/workspace/:workspaceId/admin/actions` runs resilience admin actions such as refreshing the summary.
- Only workspace owners and admins can access resilience admin endpoints.
- The web billing panel shows resilience admin tools for authorized roles.

Production availability rollout readiness:

- `GET /api/availability/readiness` returns operator-facing production availability checklist results (`ready` or `not_ready`).
- Checks cover PostgreSQL connectivity, availability signal table coverage, API health endpoints, dependency uptime signals, and uptime readiness signals.
- The web billing panel shows availability rollout status and per-check guidance.

Workspace availability admin tools:

- `GET /api/availability/workspace/:workspaceId/admin` returns owner/admin availability summary with workspace run outcome domains.
- `POST /api/availability/workspace/:workspaceId/admin/actions` runs availability admin actions such as refreshing the summary.
- Only workspace owners and admins can access availability admin endpoints.
- The web billing panel shows availability admin tools for authorized roles.

Production reliability rollout readiness:

- `GET /api/reliability/readiness` returns operator-facing production reliability checklist results (`ready` or `not_ready`).
- Checks cover PostgreSQL connectivity, reliability signal table coverage, model health reliability signals, idempotency fault tolerance, and fault tolerance readiness signals.
- The web billing panel shows reliability rollout status and per-check guidance.

Workspace reliability admin tools:

- `GET /api/reliability/workspace/:workspaceId/admin` returns owner/admin reliability summary with workspace fault tolerance domains.
- `POST /api/reliability/workspace/:workspaceId/admin/actions` runs reliability admin actions such as refreshing the summary.
- Only workspace owners and admins can access reliability admin endpoints.
- The web billing panel shows reliability admin tools for authorized roles.

Production stability rollout readiness:

- `GET /api/stability/readiness` returns operator-facing production stability checklist results (`ready` or `not_ready`).
- Checks cover PostgreSQL connectivity, stability signal table coverage, schema migration stability, artifact persistence stability, and drift readiness signals.
- The web billing panel shows stability rollout status and per-check guidance.

Workspace stability admin tools:

- `GET /api/stability/workspace/:workspaceId/admin` returns owner/admin stability summary with workspace run outcome and artifact domains.
- `POST /api/stability/workspace/:workspaceId/admin/actions` runs stability admin actions such as refreshing the summary.
- Only workspace owners and admins can access stability admin endpoints.
- The web billing panel shows stability admin tools for authorized roles.

Production consistency rollout readiness:

- `GET /api/consistency/readiness` returns operator-facing production consistency checklist results (`ready` or `not_ready`).
- Checks cover PostgreSQL connectivity, consistency signal table coverage, run workflow alignment, idempotency consistency, and alignment readiness signals.
- The web billing panel shows consistency rollout status and per-check guidance.

Workspace consistency admin tools:

- `GET /api/consistency/workspace/:workspaceId/admin` returns owner/admin consistency summary with workspace workflow and idempotency domains.
- `POST /api/consistency/workspace/:workspaceId/admin/actions` runs consistency admin actions such as refreshing the summary.
- Only workspace owners and admins can access consistency admin endpoints.
- The web billing panel shows consistency admin tools for authorized roles.

Production integrity rollout readiness:

- `GET /api/integrity/readiness` returns operator-facing production integrity checklist results (`ready` or `not_ready`).
- Checks cover PostgreSQL connectivity, integrity signal table coverage, artifact content integrity, shield scan integrity, and verification readiness signals.
- The web billing panel shows integrity rollout status and per-check guidance.

Workspace integrity admin tools:

- `GET /api/integrity/workspace/:workspaceId/admin` returns owner/admin integrity summary with workspace artifact and shield scan domains.
- `POST /api/integrity/workspace/:workspaceId/admin/actions` runs integrity admin actions such as refreshing the summary.
- Only workspace owners and admins can access integrity admin endpoints.
- The web billing panel shows integrity admin tools for authorized roles.

Production durability rollout readiness:

- `GET /api/durability/readiness` returns operator-facing production durability checklist results (`ready` or `not_ready`).
- Checks cover PostgreSQL connectivity, durability signal table coverage, artifact persistence durability, Redis persistence durability, and persistence readiness signals.
- The web billing panel shows durability rollout status and per-check guidance.

Workspace durability admin tools:

- `GET /api/durability/workspace/:workspaceId/admin` returns owner/admin durability summary with workspace artifact and usage event domains.
- `POST /api/durability/workspace/:workspaceId/admin/actions` runs durability admin actions such as refreshing the summary.
- Only workspace owners and admins can access durability admin endpoints.
- The web billing panel shows durability admin tools for authorized roles.

Production recoverability rollout readiness:

- `GET /api/recoverability/readiness` returns operator-facing production recoverability checklist results (`ready` or `not_ready`).
- Checks cover PostgreSQL connectivity, recoverability signal table coverage, run workflow recovery, stream recovery signals, and recovery readiness signals.
- The web billing panel shows recoverability rollout status and per-check guidance.

Workspace recoverability admin tools:

- `GET /api/recoverability/workspace/:workspaceId/admin` returns owner/admin recoverability summary with workspace run outcome and workflow domains.
- `POST /api/recoverability/workspace/:workspaceId/admin/actions` runs recoverability admin actions such as refreshing the summary.
- Only workspace owners and admins can access recoverability admin endpoints.
- The web billing panel shows recoverability admin tools for authorized roles.

Production maintainability rollout readiness:

- `GET /api/maintainability/readiness` returns operator-facing production maintainability checklist results (`ready` or `not_ready`).
- Checks cover PostgreSQL connectivity, maintainability signal table coverage, migration operability, model health maintainability, and operability readiness signals.
- The web billing panel shows maintainability rollout status and per-check guidance.

Workspace maintainability admin tools:

- `GET /api/maintainability/workspace/:workspaceId/admin` returns owner/admin maintainability summary with workspace run outcome and telemetry domains.
- `POST /api/maintainability/workspace/:workspaceId/admin/actions` runs maintainability admin actions such as refreshing the summary.
- Only workspace owners and admins can access maintainability admin endpoints.
- The web billing panel shows maintainability admin tools for authorized roles.

Production scalability rollout readiness:

- `GET /api/scalability/readiness` returns operator-facing production scalability checklist results (`ready` or `not_ready`).
- Checks cover PostgreSQL connectivity, scalability signal table coverage, usage limit scalability, workspace growth signals, and growth readiness signals.
- The web billing panel shows scalability rollout status and per-check guidance.

Workspace scalability admin tools:

- `GET /api/scalability/workspace/:workspaceId/admin` returns owner/admin scalability summary with workspace run load and membership domains.
- `POST /api/scalability/workspace/:workspaceId/admin/actions` runs scalability admin actions such as refreshing the summary.
- Only workspace owners and admins can access scalability admin endpoints.
- The web billing panel shows scalability admin tools for authorized roles.

Production traceability rollout readiness:

- `GET /api/traceability/readiness` returns operator-facing production traceability checklist results (`ready` or `not_ready`).
- Checks cover PostgreSQL connectivity, traceability signal table coverage, run lineage traceability, artifact lineage traceability, and lineage readiness signals.
- The web billing panel shows traceability rollout status and per-check guidance.

Workspace traceability admin tools:

- `GET /api/traceability/workspace/:workspaceId/admin` returns owner/admin traceability summary with workspace run and artifact lineage domains.
- `POST /api/traceability/workspace/:workspaceId/admin/actions` runs traceability admin actions such as refreshing the summary.
- Only workspace owners and admins can access traceability admin endpoints.
- The web billing panel shows traceability admin tools for authorized roles.

Current `v5.235` behavior:

- Production citationizability rollout readiness validates citationizability coverage and readiness through `GET /api/citationizability/readiness`.
- Workspace owners and admins can inspect workspace citationizability metrics from `GET /api/citationizability/workspace/:workspaceId/admin`.
- The web billing panel shows citationizability rollout checks and workspace citationizability admin tools.

Current `v5.234` behavior:

- Production annotationizability rollout readiness validates annotationizability coverage and readiness through `GET /api/annotationizability/readiness`.
- Workspace owners and admins can inspect workspace annotationizability metrics from `GET /api/annotationizability/workspace/:workspaceId/admin`.
- The web billing panel shows annotationizability rollout checks and workspace annotationizability admin tools.

Current `v5.233` behavior:

- Production documentizability rollout readiness validates documentizability coverage and readiness through `GET /api/documentizability/readiness`.
- Workspace owners and admins can inspect workspace documentizability metrics from `GET /api/documentizability/workspace/:workspaceId/admin`.
- The web billing panel shows documentizability rollout checks and workspace documentizability admin tools.

Current `v5.232` behavior:

- Production referencizability rollout readiness validates referencizability coverage and readiness through `GET /api/referencizability/readiness`.
- Workspace owners and admins can inspect workspace referencizability metrics from `GET /api/referencizability/workspace/:workspaceId/admin`.
- The web billing panel shows referencizability rollout checks and workspace referencizability admin tools.

Current `v5.231` behavior:

- Production bibliographizability rollout readiness validates bibliographizability coverage and readiness through `GET /api/bibliographizability/readiness`.
- Workspace owners and admins can inspect workspace bibliographizability metrics from `GET /api/bibliographizability/workspace/:workspaceId/admin`.
- The web billing panel shows bibliographizability rollout checks and workspace bibliographizability admin tools.

Current `v5.230` behavior:

- Production compilatizability rollout readiness validates compilatizability coverage and readiness through `GET /api/compilatizability/readiness`.
- Workspace owners and admins can inspect workspace compilatizability metrics from `GET /api/compilatizability/workspace/:workspaceId/admin`.
- The web billing panel shows compilatizability rollout checks and workspace compilatizability admin tools.

Current `v5.229` behavior:

- Production aggregatizability rollout readiness validates aggregatizability coverage and readiness through `GET /api/aggregatizability/readiness`.
- Workspace owners and admins can inspect workspace aggregatizability metrics from `GET /api/aggregatizability/workspace/:workspaceId/admin`.
- The web billing panel shows aggregatizability rollout checks and workspace aggregatizability admin tools.

Current `v5.228` behavior:

- Production collectizability rollout readiness validates collectizability coverage and readiness through `GET /api/collectizability/readiness`.
- Workspace owners and admins can inspect workspace collectizability metrics from `GET /api/collectizability/workspace/:workspaceId/admin`.
- The web billing panel shows collectizability rollout checks and workspace collectizability admin tools.

Current `v5.227` behavior:

- Production curatizability rollout readiness validates curatizability coverage and readiness through `GET /api/curatizability/readiness`.
- Workspace owners and admins can inspect workspace curatizability metrics from `GET /api/curatizability/workspace/:workspaceId/admin`.
- The web billing panel shows curatizability rollout checks and workspace curatizability admin tools.

Current `v5.226` behavior:

- Production archivizability rollout readiness validates archivizability coverage and readiness through `GET /api/archivizability/readiness`.
- Workspace owners and admins can inspect workspace archivizability metrics from `GET /api/archivizability/workspace/:workspaceId/admin`.
- The web billing panel shows archivizability rollout checks and workspace archivizability admin tools.

Current `v5.245` behavior:

- Production footnotizability rollout readiness validates footnotizability coverage and readiness through `GET /api/footnotizability/readiness`.
- Workspace owners and admins can inspect workspace footnotizability metrics from `GET /api/footnotizability/workspace/:workspaceId/admin`.
- The web billing panel shows footnotizability rollout checks and workspace footnotizability admin tools.

Current `v5.244` behavior:

- Production vocabularizability rollout readiness validates vocabularizability coverage and readiness through `GET /api/vocabularizability/readiness`.
- Workspace owners and admins can inspect workspace vocabularizability metrics from `GET /api/vocabularizability/workspace/:workspaceId/admin`.
- The web billing panel shows vocabularizability rollout checks and workspace vocabularizability admin tools.

Current `v5.243` behavior:

- Production terminologizability rollout readiness validates terminologizability coverage and readiness through `GET /api/terminologizability/readiness`.
- Workspace owners and admins can inspect workspace terminologizability metrics from `GET /api/terminologizability/workspace/:workspaceId/admin`.
- The web billing panel shows terminologizability rollout checks and workspace terminologizability admin tools.

Current `v5.242` behavior:

- Production thesaurusizability rollout readiness validates thesaurusizability coverage and readiness through `GET /api/thesaurusizability/readiness`.
- Workspace owners and admins can inspect workspace thesaurusizability metrics from `GET /api/thesaurusizability/workspace/:workspaceId/admin`.
- The web billing panel shows thesaurusizability rollout checks and workspace thesaurusizability admin tools.

Current `v5.241` behavior:

- Production glossarizability rollout readiness validates glossarizability coverage and readiness through `GET /api/glossarizability/readiness`.
- Workspace owners and admins can inspect workspace glossarizability metrics from `GET /api/glossarizability/workspace/:workspaceId/admin`.
- The web billing panel shows glossarizability rollout checks and workspace glossarizability admin tools.

Current `v5.240` behavior:

- Production normalizability rollout readiness validates normalizability coverage and readiness through `GET /api/normalizability/readiness`.
- Workspace owners and admins can inspect workspace normalizability metrics from `GET /api/normalizability/workspace/:workspaceId/admin`.
- The web billing panel shows normalizability rollout checks and workspace normalizability admin tools.

Current `v5.239` behavior:

- Production serializability rollout readiness validates serializability coverage and readiness through `GET /api/serializability/readiness`.
- Workspace owners and admins can inspect workspace serializability metrics from `GET /api/serializability/workspace/:workspaceId/admin`.
- The web billing panel shows serializability rollout checks and workspace serializability admin tools.

Current `v5.238` behavior:

- Production parametrizability rollout readiness validates parametrizability coverage and readiness through `GET /api/parametrizability/readiness`.
- Workspace owners and admins can inspect workspace parametrizability metrics from `GET /api/parametrizability/workspace/:workspaceId/admin`.
- The web billing panel shows parametrizability rollout checks and workspace parametrizability admin tools.

Current `v5.237` behavior:

- Production harmonizability rollout readiness validates harmonizability coverage and readiness through `GET /api/harmonizability/readiness`.
- Workspace owners and admins can inspect workspace harmonizability metrics from `GET /api/harmonizability/workspace/:workspaceId/admin`.
- The web billing panel shows harmonizability rollout checks and workspace harmonizability admin tools.

Current `v5.236` behavior:

- Production consolidatizability rollout readiness validates consolidatizability coverage and readiness through `GET /api/consolidatizability/readiness`.
- Workspace owners and admins can inspect workspace consolidatizability metrics from `GET /api/consolidatizability/workspace/:workspaceId/admin`.
- The web billing panel shows consolidatizability rollout checks and workspace consolidatizability admin tools.

Current `v5.255` behavior:

- Production deducizability rollout readiness validates deducizability coverage and readiness through `GET /api/deducizability/readiness`.
- Workspace owners and admins can inspect workspace deducizability metrics from `GET /api/deducizability/workspace/:workspaceId/admin`.
- The web billing panel shows deducizability rollout checks and workspace deducizability admin tools.

Current `v5.254` behavior:

- Production inferencizability rollout readiness validates inferencizability coverage and readiness through `GET /api/inferencizability/readiness`.
- Workspace owners and admins can inspect workspace inferencizability metrics from `GET /api/inferencizability/workspace/:workspaceId/admin`.
- The web billing panel shows inferencizability rollout checks and workspace inferencizability admin tools.

Current `v5.253` behavior:

- Production definizability rollout readiness validates definizability coverage and readiness through `GET /api/definizability/readiness`.
- Workspace owners and admins can inspect workspace definizability metrics from `GET /api/definizability/workspace/:workspaceId/admin`.
- The web billing panel shows definizability rollout checks and workspace definizability admin tools.

Current `v5.252` behavior:

- Production concretizability rollout readiness validates concretizability coverage and readiness through `GET /api/concretizability/readiness`.
- Workspace owners and admins can inspect workspace concretizability metrics from `GET /api/concretizability/workspace/:workspaceId/admin`.
- The web billing panel shows concretizability rollout checks and workspace concretizability admin tools.

Current `v5.251` behavior:

- Production abstractizability rollout readiness validates abstractizability coverage and readiness through `GET /api/abstractizability/readiness`.
- Workspace owners and admins can inspect workspace abstractizability metrics from `GET /api/abstractizability/workspace/:workspaceId/admin`.
- The web billing panel shows abstractizability rollout checks and workspace abstractizability admin tools.

Current `v5.250` behavior:

- Production canonicalizability rollout readiness validates canonicalizability coverage and readiness through `GET /api/canonicalizability/readiness`.
- Workspace owners and admins can inspect workspace canonicalizability metrics from `GET /api/canonicalizability/workspace/:workspaceId/admin`.
- The web billing panel shows canonicalizability rollout checks and workspace canonicalizability admin tools.

Current `v5.249` behavior:

- Production formalizability rollout readiness validates formalizability coverage and readiness through `GET /api/formalizability/readiness`.
- Workspace owners and admins can inspect workspace formalizability metrics from `GET /api/formalizability/workspace/:workspaceId/admin`.
- The web billing panel shows formalizability rollout checks and workspace formalizability admin tools.

Current `v5.248` behavior:

- Production standardizability rollout readiness validates standardizability coverage and readiness through `GET /api/standardizability/readiness`.
- Workspace owners and admins can inspect workspace standardizability metrics from `GET /api/standardizability/workspace/:workspaceId/admin`.
- The web billing panel shows standardizability rollout checks and workspace standardizability admin tools.

Current `v5.247` behavior:

- Production generalizability rollout readiness validates generalizability coverage and readiness through `GET /api/generalizability/readiness`.
- Workspace owners and admins can inspect workspace generalizability metrics from `GET /api/generalizability/workspace/:workspaceId/admin`.
- The web billing panel shows generalizability rollout checks and workspace generalizability admin tools.

Current `v5.246` behavior:

- Production contextualizability rollout readiness validates contextualizability coverage and readiness through `GET /api/contextualizability/readiness`.
- Workspace owners and admins can inspect workspace contextualizability metrics from `GET /api/contextualizability/workspace/:workspaceId/admin`.
- The web billing panel shows contextualizability rollout checks and workspace contextualizability admin tools.

Current `v5.265` behavior:

- Production falsifiizability rollout readiness validates falsifiizability coverage and readiness through `GET /api/falsifiizability/readiness`.
- Workspace owners and admins can inspect workspace falsifiizability metrics from `GET /api/falsifiizability/workspace/:workspaceId/admin`.
- The web billing panel shows falsifiizability rollout checks and workspace falsifiizability admin tools.

Current `v5.264` behavior:

- Production corroborizability rollout readiness validates corroborizability coverage and readiness through `GET /api/corroborizability/readiness`.
- Workspace owners and admins can inspect workspace corroborizability metrics from `GET /api/corroborizability/workspace/:workspaceId/admin`.
- The web billing panel shows corroborizability rollout checks and workspace corroborizability admin tools.

Current `v5.263` behavior:

- Production retrodictizability rollout readiness validates retrodictizability coverage and readiness through `GET /api/retrodictizability/readiness`.
- Workspace owners and admins can inspect workspace retrodictizability metrics from `GET /api/retrodictizability/workspace/:workspaceId/admin`.
- The web billing panel shows retrodictizability rollout checks and workspace retrodictizability admin tools.

Current `v5.262` behavior:

- Production abductizability rollout readiness validates abductizability coverage and readiness through `GET /api/abductizability/readiness`.
- Workspace owners and admins can inspect workspace abductizability metrics from `GET /api/abductizability/workspace/:workspaceId/admin`.
- The web billing panel shows abductizability rollout checks and workspace abductizability admin tools.

Current `v5.261` behavior:

- Production inductizability rollout readiness validates inductizability coverage and readiness through `GET /api/inductizability/readiness`.
- Workspace owners and admins can inspect workspace inductizability metrics from `GET /api/inductizability/workspace/:workspaceId/admin`.
- The web billing panel shows inductizability rollout checks and workspace inductizability admin tools.

Current `v5.260` behavior:

- Production extrapolizability rollout readiness validates extrapolizability coverage and readiness through `GET /api/extrapolizability/readiness`.
- Workspace owners and admins can inspect workspace extrapolizability metrics from `GET /api/extrapolizability/workspace/:workspaceId/admin`.
- The web billing panel shows extrapolizability rollout checks and workspace extrapolizability admin tools.

Current `v5.259` behavior:

- Production predictizability rollout readiness validates predictizability coverage and readiness through `GET /api/predictizability/readiness`.
- Workspace owners and admins can inspect workspace predictizability metrics from `GET /api/predictizability/workspace/:workspaceId/admin`.
- The web billing panel shows predictizability rollout checks and workspace predictizability admin tools.

Current `v5.258` behavior:

- Production determinizability rollout readiness validates determinizability coverage and readiness through `GET /api/determinizability/readiness`.
- Workspace owners and admins can inspect workspace determinizability metrics from `GET /api/determinizability/workspace/:workspaceId/admin`.
- The web billing panel shows determinizability rollout checks and workspace determinizability admin tools.

Current `v5.257` behavior:

- Production stochasticizability rollout readiness validates stochasticizability coverage and readiness through `GET /api/stochasticizability/readiness`.
- Workspace owners and admins can inspect workspace stochasticizability metrics from `GET /api/stochasticizability/workspace/:workspaceId/admin`.
- The web billing panel shows stochasticizability rollout checks and workspace stochasticizability admin tools.

Current `v5.256` behavior:

- Production probabilizability rollout readiness validates probabilizability coverage and readiness through `GET /api/probabilizability/readiness`.
- Workspace owners and admins can inspect workspace probabilizability metrics from `GET /api/probabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows probabilizability rollout checks and workspace probabilizability admin tools.

Current `v5.275` behavior:

- Production tolerizability rollout readiness validates tolerizability coverage and readiness through `GET /api/tolerizability/readiness`.
- Workspace owners and admins can inspect workspace tolerizability metrics from `GET /api/tolerizability/workspace/:workspaceId/admin`.
- The web billing panel shows tolerizability rollout checks and workspace tolerizability admin tools.

Current `v5.274` behavior:

- Production comparizability rollout readiness validates comparizability coverage and readiness through `GET /api/comparizability/readiness`.
- Workspace owners and admins can inspect workspace comparizability metrics from `GET /api/comparizability/workspace/:workspaceId/admin`.
- The web billing panel shows comparizability rollout checks and workspace comparizability admin tools.

Current `v5.273` behavior:

- Production benchmarkizability rollout readiness validates benchmarkizability coverage and readiness through `GET /api/benchmarkizability/readiness`.
- Workspace owners and admins can inspect workspace benchmarkizability metrics from `GET /api/benchmarkizability/workspace/:workspaceId/admin`.
- The web billing panel shows benchmarkizability rollout checks and workspace benchmarkizability admin tools.

Current `v5.272` behavior:

- Production metricizability rollout readiness validates metricizability coverage and readiness through `GET /api/metricizability/readiness`.
- Workspace owners and admins can inspect workspace metricizability metrics from `GET /api/metricizability/workspace/:workspaceId/admin`.
- The web billing panel shows metricizability rollout checks and workspace metricizability admin tools.

Current `v5.271` behavior:

- Production calibratizability rollout readiness validates calibratizability coverage and readiness through `GET /api/calibratizability/readiness`.
- Workspace owners and admins can inspect workspace calibratizability metrics from `GET /api/calibratizability/workspace/:workspaceId/admin`.
- The web billing panel shows calibratizability rollout checks and workspace calibratizability admin tools.

Current `v5.270` behavior:

- Production optimizability rollout readiness validates optimizability coverage and readiness through `GET /api/optimizability/readiness`.
- Workspace owners and admins can inspect workspace optimizability metrics from `GET /api/optimizability/workspace/:workspaceId/admin`.
- The web billing panel shows optimizability rollout checks and workspace optimizability admin tools.

Current `v5.269` behavior:

- Production simulatizability rollout readiness validates simulatizability coverage and readiness through `GET /api/simulatizability/readiness`.
- Workspace owners and admins can inspect workspace simulatizability metrics from `GET /api/simulatizability/workspace/:workspaceId/admin`.
- The web billing panel shows simulatizability rollout checks and workspace simulatizability admin tools.

Current `v5.268` behavior:

- Production heuristizability rollout readiness validates heuristizability coverage and readiness through `GET /api/heuristizability/readiness`.
- Workspace owners and admins can inspect workspace heuristizability metrics from `GET /api/heuristizability/workspace/:workspaceId/admin`.
- The web billing panel shows heuristizability rollout checks and workspace heuristizability admin tools.

Current `v5.267` behavior:

- Production regressizability rollout readiness validates regressizability coverage and readiness through `GET /api/regressizability/readiness`.
- Workspace owners and admins can inspect workspace regressizability metrics from `GET /api/regressizability/workspace/:workspaceId/admin`.
- The web billing panel shows regressizability rollout checks and workspace regressizability admin tools.

Current `v5.266` behavior:

- Production interpolizability rollout readiness validates interpolizability coverage and readiness through `GET /api/interpolizability/readiness`.
- Workspace owners and admins can inspect workspace interpolizability metrics from `GET /api/interpolizability/workspace/:workspaceId/admin`.
- The web billing panel shows interpolizability rollout checks and workspace interpolizability admin tools.

Current `v5.285` behavior:

- Production dependableizability rollout readiness validates dependableizability coverage and readiness through `GET /api/dependableizability/readiness`.
- Workspace owners and admins can inspect workspace dependableizability metrics from `GET /api/dependableizability/workspace/:workspaceId/admin`.
- The web billing panel shows dependableizability rollout checks and workspace dependableizability admin tools.

Current `v5.284` behavior:

- Production robustizability rollout readiness validates robustizability coverage and readiness through `GET /api/robustizability/readiness`.
- Workspace owners and admins can inspect workspace robustizability metrics from `GET /api/robustizability/workspace/:workspaceId/admin`.
- The web billing panel shows robustizability rollout checks and workspace robustizability admin tools.

Current `v5.283` behavior:

- Production resilientizability rollout readiness validates resilientizability coverage and readiness through `GET /api/resilientizability/readiness`.
- Workspace owners and admins can inspect workspace resilientizability metrics from `GET /api/resilientizability/workspace/:workspaceId/admin`.
- The web billing panel shows resilientizability rollout checks and workspace resilientizability admin tools.

Current `v5.282` behavior:

- Production elasticizability rollout readiness validates elasticizability coverage and readiness through `GET /api/elasticizability/readiness`.
- Workspace owners and admins can inspect workspace elasticizability metrics from `GET /api/elasticizability/workspace/:workspaceId/admin`.
- The web billing panel shows elasticizability rollout checks and workspace elasticizability admin tools.

Current `v5.281` behavior:

- Production scalabilizability rollout readiness validates scalabilizability coverage and readiness through `GET /api/scalabilizability/readiness`.
- Workspace owners and admins can inspect workspace scalabilizability metrics from `GET /api/scalabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows scalabilizability rollout checks and workspace scalabilizability admin tools.

Current `v5.280` behavior:

- Production adaptizability rollout readiness validates adaptizability coverage and readiness through `GET /api/adaptizability/readiness`.
- Workspace owners and admins can inspect workspace adaptizability metrics from `GET /api/adaptizability/workspace/:workspaceId/admin`.
- The web billing panel shows adaptizability rollout checks and workspace adaptizability admin tools.

Current `v5.279` behavior:

- Production stabilizability rollout readiness validates stabilizability coverage and readiness through `GET /api/stabilizability/readiness`.
- Workspace owners and admins can inspect workspace stabilizability metrics from `GET /api/stabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows stabilizability rollout checks and workspace stabilizability admin tools.

Current `v5.278` behavior:

- Production convergizability rollout readiness validates convergizability coverage and readiness through `GET /api/convergizability/readiness`.
- Workspace owners and admins can inspect workspace convergizability metrics from `GET /api/convergizability/workspace/:workspaceId/admin`.
- The web billing panel shows convergizability rollout checks and workspace convergizability admin tools.

Current `v5.277` behavior:

- Production iterativizability rollout readiness validates iterativizability coverage and readiness through `GET /api/iterativizability/readiness`.
- Workspace owners and admins can inspect workspace iterativizability metrics from `GET /api/iterativizability/workspace/:workspaceId/admin`.
- The web billing panel shows iterativizability rollout checks and workspace iterativizability admin tools.

Current `v5.276` behavior:

- Production approximatizability rollout readiness validates approximatizability coverage and readiness through `GET /api/approximatizability/readiness`.
- Workspace owners and admins can inspect workspace approximatizability metrics from `GET /api/approximatizability/workspace/:workspaceId/admin`.
- The web billing panel shows approximatizability rollout checks and workspace approximatizability admin tools.

Current `v5.295` behavior:

- Production observabilizability rollout readiness validates observabilizability coverage and readiness through `GET /api/observabilizability/readiness`.
- Workspace owners and admins can inspect workspace observabilizability metrics from `GET /api/observabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows observabilizability rollout checks and workspace observabilizability admin tools.

Current `v5.294` behavior:

- Production alertabilizability rollout readiness validates alertabilizability coverage and readiness through `GET /api/alertabilizability/readiness`.
- Workspace owners and admins can inspect workspace alertabilizability metrics from `GET /api/alertabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows alertabilizability rollout checks and workspace alertabilizability admin tools.

Current `v5.293` behavior:

- Production monitorizability rollout readiness validates monitorizability coverage and readiness through `GET /api/monitorizability/readiness`.
- Workspace owners and admins can inspect workspace monitorizability metrics from `GET /api/monitorizability/workspace/:workspaceId/admin`.
- The web billing panel shows monitorizability rollout checks and workspace monitorizability admin tools.

Current `v5.292` behavior:

- Production traceabilizability rollout readiness validates traceabilizability coverage and readiness through `GET /api/traceabilizability/readiness`.
- Workspace owners and admins can inspect workspace traceabilizability metrics from `GET /api/traceabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows traceabilizability rollout checks and workspace traceabilizability admin tools.

Current `v5.291` behavior:

- Production availabilizability rollout readiness validates availabilizability coverage and readiness through `GET /api/availabilizability/readiness`.
- Workspace owners and admins can inspect workspace availabilizability metrics from `GET /api/availabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows availabilizability rollout checks and workspace availabilizability admin tools.

Current `v5.290` behavior:

- Production sustainizability rollout readiness validates sustainizability coverage and readiness through `GET /api/sustainizability/readiness`.
- Workspace owners and admins can inspect workspace sustainizability metrics from `GET /api/sustainizability/workspace/:workspaceId/admin`.
- The web billing panel shows sustainizability rollout checks and workspace sustainizability admin tools.

Current `v5.289` behavior:

- Production continuizability rollout readiness validates continuizability coverage and readiness through `GET /api/continuizability/readiness`.
- Workspace owners and admins can inspect workspace continuizability metrics from `GET /api/continuizability/workspace/:workspaceId/admin`.
- The web billing panel shows continuizability rollout checks and workspace continuizability admin tools.

Current `v5.288` behavior:

- Production failoverizability rollout readiness validates failoverizability coverage and readiness through `GET /api/failoverizability/readiness`.
- Workspace owners and admins can inspect workspace failoverizability metrics from `GET /api/failoverizability/workspace/:workspaceId/admin`.
- The web billing panel shows failoverizability rollout checks and workspace failoverizability admin tools.

Current `v5.287` behavior:

- Production redundizability rollout readiness validates redundizability coverage and readiness through `GET /api/redundizability/readiness`.
- Workspace owners and admins can inspect workspace redundizability metrics from `GET /api/redundizability/workspace/:workspaceId/admin`.
- The web billing panel shows redundizability rollout checks and workspace redundizability admin tools.

Current `v5.286` behavior:

- Production recoverizability rollout readiness validates recoverizability coverage and readiness through `GET /api/recoverizability/readiness`.
- Workspace owners and admins can inspect workspace recoverizability metrics from `GET /api/recoverizability/workspace/:workspaceId/admin`.
- The web billing panel shows recoverizability rollout checks and workspace recoverizability admin tools.

Current `v5.305` behavior:

- Production troubleshootizability rollout readiness validates troubleshootizability coverage and readiness through `GET /api/troubleshootizability/readiness`.
- Workspace owners and admins can inspect workspace troubleshootizability metrics from `GET /api/troubleshootizability/workspace/:workspaceId/admin`.
- The web billing panel shows troubleshootizability rollout checks and workspace troubleshootizability admin tools.

Current `v5.304` behavior:

- Production diagnosabilizability rollout readiness validates diagnosabilizability coverage and readiness through `GET /api/diagnosabilizability/readiness`.
- Workspace owners and admins can inspect workspace diagnosabilizability metrics from `GET /api/diagnosabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows diagnosabilizability rollout checks and workspace diagnosabilizability admin tools.

Current `v5.303` behavior:

- Production maintainabilizability rollout readiness validates maintainabilizability coverage and readiness through `GET /api/maintainabilizability/readiness`.
- Workspace owners and admins can inspect workspace maintainabilizability metrics from `GET /api/maintainabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows maintainabilizability rollout checks and workspace maintainabilizability admin tools.

Current `v5.302` behavior:

- Production operabilizability rollout readiness validates operabilizability coverage and readiness through `GET /api/operabilizability/readiness`.
- Workspace owners and admins can inspect workspace operabilizability metrics from `GET /api/operabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows operabilizability rollout checks and workspace operabilizability admin tools.

Current `v5.301` behavior:

- Production configurabilizability rollout readiness validates configurabilizability coverage and readiness through `GET /api/configurabilizability/readiness`.
- Workspace owners and admins can inspect workspace configurabilizability metrics from `GET /api/configurabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows configurabilizability rollout checks and workspace configurabilizability admin tools.

Current `v5.300` behavior:

- Production deployabilizability rollout readiness validates deployabilizability coverage and readiness through `GET /api/deployabilizability/readiness`.
- Workspace owners and admins can inspect workspace deployabilizability metrics from `GET /api/deployabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows deployabilizability rollout checks and workspace deployabilizability admin tools.

Current `v5.299` behavior:

- Production autoscalingizability rollout readiness validates autoscalingizability coverage and readiness through `GET /api/autoscalingizability/readiness`.
- Workspace owners and admins can inspect workspace autoscalingizability metrics from `GET /api/autoscalingizability/workspace/:workspaceId/admin`.
- The web billing panel shows autoscalingizability rollout checks and workspace autoscalingizability admin tools.

Current `v5.298` behavior:

- Production loadbalancizability rollout readiness validates loadbalancizability coverage and readiness through `GET /api/loadbalancizability/readiness`.
- Workspace owners and admins can inspect workspace loadbalancizability metrics from `GET /api/loadbalancizability/workspace/:workspaceId/admin`.
- The web billing panel shows loadbalancizability rollout checks and workspace loadbalancizability admin tools.

Current `v5.297` behavior:

- Production replicabilizability rollout readiness validates replicabilizability coverage and readiness through `GET /api/replicabilizability/readiness`.
- Workspace owners and admins can inspect workspace replicabilizability metrics from `GET /api/replicabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows replicabilizability rollout checks and workspace replicabilizability admin tools.

Current `v5.296` behavior:

- Production restorabilizability rollout readiness validates restorabilizability coverage and readiness through `GET /api/restorabilizability/readiness`.
- Workspace owners and admins can inspect workspace restorabilizability metrics from `GET /api/restorabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows restorabilizability rollout checks and workspace restorabilizability admin tools.

Current `v5.315` behavior:

- Production triggerizability rollout readiness validates triggerizability coverage and readiness through `GET /api/triggerizability/readiness`.
- Workspace owners and admins can inspect workspace triggerizability metrics from `GET /api/triggerizability/workspace/:workspaceId/admin`.
- The web billing panel shows triggerizability rollout checks and workspace triggerizability admin tools.

Current `v5.314` behavior:

- Production schedulizability rollout readiness validates schedulizability coverage and readiness through `GET /api/schedulizability/readiness`.
- Workspace owners and admins can inspect workspace schedulizability metrics from `GET /api/schedulizability/workspace/:workspaceId/admin`.
- The web billing panel shows schedulizability rollout checks and workspace schedulizability admin tools.

Current `v5.313` behavior:

- Production orchestrizability rollout readiness validates orchestrizability coverage and readiness through `GET /api/orchestrizability/readiness`.
- Workspace owners and admins can inspect workspace orchestrizability metrics from `GET /api/orchestrizability/workspace/:workspaceId/admin`.
- The web billing panel shows orchestrizability rollout checks and workspace orchestrizability admin tools.

Current `v5.312` behavior:

- Production automatizability rollout readiness validates automatizability coverage and readiness through `GET /api/automatizability/readiness`.
- Workspace owners and admins can inspect workspace automatizability metrics from `GET /api/automatizability/workspace/:workspaceId/admin`.
- The web billing panel shows automatizability rollout checks and workspace automatizability admin tools.

Current `v5.311` behavior:

- Production scriptabilizability rollout readiness validates scriptabilizability coverage and readiness through `GET /api/scriptabilizability/readiness`.
- Workspace owners and admins can inspect workspace scriptabilizability metrics from `GET /api/scriptabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows scriptabilizability rollout checks and workspace scriptabilizability admin tools.

Current `v5.310` behavior:

- Production featureflagizability rollout readiness validates featureflagizability coverage and readiness through `GET /api/featureflagizability/readiness`.
- Workspace owners and admins can inspect workspace featureflagizability metrics from `GET /api/featureflagizability/workspace/:workspaceId/admin`.
- The web billing panel shows featureflagizability rollout checks and workspace featureflagizability admin tools.

Current `v5.309` behavior:

- Production progressiveizability rollout readiness validates progressiveizability coverage and readiness through `GET /api/progressiveizability/readiness`.
- Workspace owners and admins can inspect workspace progressiveizability metrics from `GET /api/progressiveizability/workspace/:workspaceId/admin`.
- The web billing panel shows progressiveizability rollout checks and workspace progressiveizability admin tools.

Current `v5.308` behavior:

- Production bluegreenizability rollout readiness validates bluegreenizability coverage and readiness through `GET /api/bluegreenizability/readiness`.
- Workspace owners and admins can inspect workspace bluegreenizability metrics from `GET /api/bluegreenizability/workspace/:workspaceId/admin`.
- The web billing panel shows bluegreenizability rollout checks and workspace bluegreenizability admin tools.

Current `v5.307` behavior:

- Production canaryizability rollout readiness validates canaryizability coverage and readiness through `GET /api/canaryizability/readiness`.
- Workspace owners and admins can inspect workspace canaryizability metrics from `GET /api/canaryizability/workspace/:workspaceId/admin`.
- The web billing panel shows canaryizability rollout checks and workspace canaryizability admin tools.

Current `v5.306` behavior:

- Production rollbackabilizability rollout readiness validates rollbackabilizability coverage and readiness through `GET /api/rollbackabilizability/readiness`.
- Workspace owners and admins can inspect workspace rollbackabilizability metrics from `GET /api/rollbackabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows rollbackabilizability rollout checks and workspace rollbackabilizability admin tools.

Current `v5.325` behavior:

- Production pluggabilizability rollout readiness validates pluggabilizability coverage and readiness through `GET /api/pluggabilizability/readiness`.
- Workspace owners and admins can inspect workspace pluggabilizability metrics from `GET /api/pluggabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows pluggabilizability rollout checks and workspace pluggabilizability admin tools.

Current `v5.324` behavior:

- Production extensibilizability rollout readiness validates extensibilizability coverage and readiness through `GET /api/extensibilizability/readiness`.
- Workspace owners and admins can inspect workspace extensibilizability metrics from `GET /api/extensibilizability/workspace/:workspaceId/admin`.
- The web billing panel shows extensibilizability rollout checks and workspace extensibilizability admin tools.

Current `v5.323` behavior:

- Production modularizability rollout readiness validates modularizability coverage and readiness through `GET /api/modularizability/readiness`.
- Workspace owners and admins can inspect workspace modularizability metrics from `GET /api/modularizability/workspace/:workspaceId/admin`.
- The web billing panel shows modularizability rollout checks and workspace modularizability admin tools.

Current `v5.322` behavior:

- Production composabilizability rollout readiness validates composabilizability coverage and readiness through `GET /api/composabilizability/readiness`.
- Workspace owners and admins can inspect workspace composabilizability metrics from `GET /api/composabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows composabilizability rollout checks and workspace composabilizability admin tools.

Current `v5.321` behavior:

- Production integrabilizability rollout readiness validates integrabilizability coverage and readiness through `GET /api/integrabilizability/readiness`.
- Workspace owners and admins can inspect workspace integrabilizability metrics from `GET /api/integrabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows integrabilizability rollout checks and workspace integrabilizability admin tools.

Current `v5.320` behavior:

- Production patchizability rollout readiness validates patchizability coverage and readiness through `GET /api/patchizability/readiness`.
- Workspace owners and admins can inspect workspace patchizability metrics from `GET /api/patchizability/workspace/:workspaceId/admin`.
- The web billing panel shows patchizability rollout checks and workspace patchizability admin tools.

Current `v5.319` behavior:

- Production upgradizability rollout readiness validates upgradizability coverage and readiness through `GET /api/upgradizability/readiness`.
- Workspace owners and admins can inspect workspace upgradizability metrics from `GET /api/upgradizability/workspace/:workspaceId/admin`.
- The web billing panel shows upgradizability rollout checks and workspace upgradizability admin tools.

Current `v5.318` behavior:

- Production migratizability rollout readiness validates migratizability coverage and readiness through `GET /api/migratizability/readiness`.
- Workspace owners and admins can inspect workspace migratizability metrics from `GET /api/migratizability/workspace/:workspaceId/admin`.
- The web billing panel shows migratizability rollout checks and workspace migratizability admin tools.

Current `v5.317` behavior:

- Production versionizability rollout readiness validates versionizability coverage and readiness through `GET /api/versionizability/readiness`.
- Workspace owners and admins can inspect workspace versionizability metrics from `GET /api/versionizability/workspace/:workspaceId/admin`.
- The web billing panel shows versionizability rollout checks and workspace versionizability admin tools.

Current `v5.316` behavior:

- Production releasizability rollout readiness validates releasizability coverage and readiness through `GET /api/releasizability/readiness`.
- Workspace owners and admins can inspect workspace releasizability metrics from `GET /api/releasizability/workspace/:workspaceId/admin`.
- The web billing panel shows releasizability rollout checks and workspace releasizability admin tools.

Current `v5.335` behavior:

- Production boundarizability rollout readiness validates boundarizability coverage and readiness through `GET /api/boundarizability/readiness`.
- Workspace owners and admins can inspect workspace boundarizability metrics from `GET /api/boundarizability/workspace/:workspaceId/admin`.
- The web billing panel shows boundarizability rollout checks and workspace boundarizability admin tools.

Current `v5.334` behavior:

- Production containerizability rollout readiness validates containerizability coverage and readiness through `GET /api/containerizability/readiness`.
- Workspace owners and admins can inspect workspace containerizability metrics from `GET /api/containerizability/workspace/:workspaceId/admin`.
- The web billing panel shows containerizability rollout checks and workspace containerizability admin tools.

Current `v5.333` behavior:

- Production sandboxizability rollout readiness validates sandboxizability coverage and readiness through `GET /api/sandboxizability/readiness`.
- Workspace owners and admins can inspect workspace sandboxizability metrics from `GET /api/sandboxizability/workspace/:workspaceId/admin`.
- The web billing panel shows sandboxizability rollout checks and workspace sandboxizability admin tools.

Current `v5.332` behavior:

- Production isolatizability rollout readiness validates isolatizability coverage and readiness through `GET /api/isolatizability/readiness`.
- Workspace owners and admins can inspect workspace isolatizability metrics from `GET /api/isolatizability/workspace/:workspaceId/admin`.
- The web billing panel shows isolatizability rollout checks and workspace isolatizability admin tools.

Current `v5.331` behavior:

- Production encapsulizability rollout readiness validates encapsulizability coverage and readiness through `GET /api/encapsulizability/readiness`.
- Workspace owners and admins can inspect workspace encapsulizability metrics from `GET /api/encapsulizability/workspace/:workspaceId/admin`.
- The web billing panel shows encapsulizability rollout checks and workspace encapsulizability admin tools.

Current `v5.330` behavior:

- Production protocolizability rollout readiness validates protocolizability coverage and readiness through `GET /api/protocolizability/readiness`.
- Workspace owners and admins can inspect workspace protocolizability metrics from `GET /api/protocolizability/workspace/:workspaceId/admin`.
- The web billing panel shows protocolizability rollout checks and workspace protocolizability admin tools.

Current `v5.329` behavior:

- Production interfabilizability rollout readiness validates interfabilizability coverage and readiness through `GET /api/interfabilizability/readiness`.
- Workspace owners and admins can inspect workspace interfabilizability metrics from `GET /api/interfabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows interfabilizability rollout checks and workspace interfabilizability admin tools.

Current `v5.328` behavior:

- Production connectabilizability rollout readiness validates connectabilizability coverage and readiness through `GET /api/connectabilizability/readiness`.
- Workspace owners and admins can inspect workspace connectabilizability metrics from `GET /api/connectabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows connectabilizability rollout checks and workspace connectabilizability admin tools.

Current `v5.327` behavior:

- Production interoperabilizability rollout readiness validates interoperabilizability coverage and readiness through `GET /api/interoperabilizability/readiness`.
- Workspace owners and admins can inspect workspace interoperabilizability metrics from `GET /api/interoperabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows interoperabilizability rollout checks and workspace interoperabilizability admin tools.

Current `v5.326` behavior:

- Production compatibilizability rollout readiness validates compatibilizability coverage and readiness through `GET /api/compatibilizability/readiness`.
- Workspace owners and admins can inspect workspace compatibilizability metrics from `GET /api/compatibilizability/workspace/:workspaceId/admin`.
- The web billing panel shows compatibilizability rollout checks and workspace compatibilizability admin tools.

Current `v5.580` behavior:

- Production navigabilityvaultizability rollout readiness validates navigabilityvaultizability coverage and readiness through `GET /api/navigabilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace navigabilityvaultizability metrics from `GET /api/navigabilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows navigabilityvaultizability rollout checks and workspace navigabilityvaultizability admin tools.

Current `v5.579` behavior:

- Production discoverabilityvaultizability rollout readiness validates discoverabilityvaultizability coverage and readiness through `GET /api/discoverabilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace discoverabilityvaultizability metrics from `GET /api/discoverabilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows discoverabilityvaultizability rollout checks and workspace discoverabilityvaultizability admin tools.

Current `v5.578` behavior:

- Production retrievabilityvaultizability rollout readiness validates retrievabilityvaultizability coverage and readiness through `GET /api/retrievabilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace retrievabilityvaultizability metrics from `GET /api/retrievabilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows retrievabilityvaultizability rollout checks and workspace retrievabilityvaultizability admin tools.

Current `v5.577` behavior:

- Production locatabilityvaultizability rollout readiness validates locatabilityvaultizability coverage and readiness through `GET /api/locatabilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace locatabilityvaultizability metrics from `GET /api/locatabilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows locatabilityvaultizability rollout checks and workspace locatabilityvaultizability admin tools.

Current `v5.576` behavior:

- Production referencabilityvaultizability rollout readiness validates referencabilityvaultizability coverage and readiness through `GET /api/referencabilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace referencabilityvaultizability metrics from `GET /api/referencabilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows referencabilityvaultizability rollout checks and workspace referencabilityvaultizability admin tools.

Current `v5.575` behavior:

- Production assignabilityvaultizability rollout readiness validates assignabilityvaultizability coverage and readiness through `GET /api/assignabilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace assignabilityvaultizability metrics from `GET /api/assignabilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows assignabilityvaultizability rollout checks and workspace assignabilityvaultizability admin tools.

Current `v5.574` behavior:

- Production distinguishabilityvaultizability rollout readiness validates distinguishabilityvaultizability coverage and readiness through `GET /api/distinguishabilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace distinguishabilityvaultizability metrics from `GET /api/distinguishabilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows distinguishabilityvaultizability rollout checks and workspace distinguishabilityvaultizability admin tools.

Current `v5.573` behavior:

- Production comparabilityvaultizability rollout readiness validates comparabilityvaultizability coverage and readiness through `GET /api/comparabilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace comparabilityvaultizability metrics from `GET /api/comparabilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows comparabilityvaultizability rollout checks and workspace comparabilityvaultizability admin tools.

Current `v5.572` behavior:

- Production identifiabilityvaultizability rollout readiness validates identifiabilityvaultizability coverage and readiness through `GET /api/identifiabilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace identifiabilityvaultizability metrics from `GET /api/identifiabilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows identifiabilityvaultizability rollout checks and workspace identifiabilityvaultizability admin tools.

Current `v5.571` behavior:

- Production attributabilityvaultizability rollout readiness validates attributabilityvaultizability coverage and readiness through `GET /api/attributabilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace attributabilityvaultizability metrics from `GET /api/attributabilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows attributabilityvaultizability rollout checks and workspace attributabilityvaultizability admin tools.

Current `v5.570` behavior:

- Production warrantabilityvaultizability rollout readiness validates warrantabilityvaultizability coverage and readiness through `GET /api/warrantabilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace warrantabilityvaultizability metrics from `GET /api/warrantabilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows warrantabilityvaultizability rollout checks and workspace warrantabilityvaultizability admin tools.

Current `v5.569` behavior:

- Production substantiabilityvaultizability rollout readiness validates substantiabilityvaultizability coverage and readiness through `GET /api/substantiabilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace substantiabilityvaultizability metrics from `GET /api/substantiabilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows substantiabilityvaultizability rollout checks and workspace substantiabilityvaultizability admin tools.

Current `v5.568` behavior:

- Production certifiabilityvaultizability rollout readiness validates certifiabilityvaultizability coverage and readiness through `GET /api/certifiabilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace certifiabilityvaultizability metrics from `GET /api/certifiabilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows certifiabilityvaultizability rollout checks and workspace certifiabilityvaultizability admin tools.

Current `v5.567` behavior:

- Production measurabilityvaultizability rollout readiness validates measurabilityvaultizability coverage and readiness through `GET /api/measurabilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace measurabilityvaultizability metrics from `GET /api/measurabilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows measurabilityvaultizability rollout checks and workspace measurabilityvaultizability admin tools.

Current `v5.566` behavior:

- Production assessabilityvaultizability rollout readiness validates assessabilityvaultizability coverage and readiness through `GET /api/assessabilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace assessabilityvaultizability metrics from `GET /api/assessabilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows assessabilityvaultizability rollout checks and workspace assessabilityvaultizability admin tools.

Current `v5.565` behavior:

- Production reviewabilityvaultizability rollout readiness validates reviewabilityvaultizability coverage and readiness through `GET /api/reviewabilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace reviewabilityvaultizability metrics from `GET /api/reviewabilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows reviewabilityvaultizability rollout checks and workspace reviewabilityvaultizability admin tools.

Current `v5.564` behavior:

- Production justifiabilityvaultizability rollout readiness validates justifiabilityvaultizability coverage and readiness through `GET /api/justifiabilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace justifiabilityvaultizability metrics from `GET /api/justifiabilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows justifiabilityvaultizability rollout checks and workspace justifiabilityvaultizability admin tools.

Current `v5.563` behavior:

- Production demonstrabilityvaultizability rollout readiness validates demonstrabilityvaultizability coverage and readiness through `GET /api/demonstrabilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace demonstrabilityvaultizability metrics from `GET /api/demonstrabilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows demonstrabilityvaultizability rollout checks and workspace demonstrabilityvaultizability admin tools.

Current `v5.562` behavior:

- Production explainabilityvaultizability rollout readiness validates explainabilityvaultizability coverage and readiness through `GET /api/explainabilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace explainabilityvaultizability metrics from `GET /api/explainabilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows explainabilityvaultizability rollout checks and workspace explainabilityvaultizability admin tools.

Current `v5.561` behavior:

- Production defensibilityvaultizability rollout readiness validates defensibilityvaultizability coverage and readiness through `GET /api/defensibilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace defensibilityvaultizability metrics from `GET /api/defensibilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows defensibilityvaultizability rollout checks and workspace defensibilityvaultizability admin tools.

Current `v5.560` behavior:

- Production credibilityvaultizability rollout readiness validates credibilityvaultizability coverage and readiness through `GET /api/credibilityvaultizability/readiness`.
- Workspace owners and admins can inspect workspace credibilityvaultizability metrics from `GET /api/credibilityvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows credibilityvaultizability rollout checks and workspace credibilityvaultizability admin tools.

Current `v5.330` behavior:

- Production attestationvaultizability rollout readiness validates attestationvaultizability coverage and readiness through `GET /api/attestationvaultizability/readiness`.
- Workspace owners and admins can inspect workspace attestationvaultizability metrics from `GET /api/attestationvaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows attestationvaultizability rollout checks and workspace attestationvaultizability admin tools.

Current `v5.330` behavior:

- Production compliancevaultizability rollout readiness validates compliancevaultizability coverage and readiness through `GET /api/compliancevaultizability/readiness`.
- Workspace owners and admins can inspect workspace compliancevaultizability metrics from `GET /api/compliancevaultizability/workspace/:workspaceId/admin`.
- The web billing panel shows compliancevaultizability rollout checks and workspace compliancevaultizability admin tools.

Current `v5.330` behavior:

- Production integrityjournalizability rollout readiness validates integrityjournalizability coverage and readiness through `GET /api/integrityjournalizability/readiness`.
- Workspace owners and admins can inspect workspace integrityjournalizability metrics from `GET /api/integrityjournalizability/workspace/:workspaceId/admin`.
- The web billing panel shows integrityjournalizability rollout checks and workspace integrityjournalizability admin tools.

Current `v5.330` behavior:

- Production auditjournalizability rollout readiness validates auditjournalizability coverage and readiness through `GET /api/auditjournalizability/readiness`.
- Workspace owners and admins can inspect workspace auditjournalizability metrics from `GET /api/auditjournalizability/workspace/:workspaceId/admin`.
- The web billing panel shows auditjournalizability rollout checks and workspace auditjournalizability admin tools.

Current `v5.330` behavior:

- Production auditregistryizability rollout readiness validates auditregistryizability coverage and readiness through `GET /api/auditregistryizability/readiness`.
- Workspace owners and admins can inspect workspace auditregistryizability metrics from `GET /api/auditregistryizability/workspace/:workspaceId/admin`.
- The web billing panel shows auditregistryizability rollout checks and workspace auditregistryizability admin tools.

Current `v5.330` behavior:

- Production witnessproofizability rollout readiness validates witnessproofizability coverage and readiness through `GET /api/witnessproofizability/readiness`.
- Workspace owners and admins can inspect workspace witnessproofizability metrics from `GET /api/witnessproofizability/workspace/:workspaceId/admin`.
- The web billing panel shows witnessproofizability rollout checks and workspace witnessproofizability admin tools.

Current `v5.330` behavior:

- Production notarproofizability rollout readiness validates notarproofizability coverage and readiness through `GET /api/notarproofizability/readiness`.
- Workspace owners and admins can inspect workspace notarproofizability metrics from `GET /api/notarproofizability/workspace/:workspaceId/admin`.
- The web billing panel shows notarproofizability rollout checks and workspace notarproofizability admin tools.

Current `v5.330` behavior:

- Production auditproofizability rollout readiness validates auditproofizability coverage and readiness through `GET /api/auditproofizability/readiness`.
- Workspace owners and admins can inspect workspace auditproofizability metrics from `GET /api/auditproofizability/workspace/:workspaceId/admin`.
- The web billing panel shows auditproofizability rollout checks and workspace auditproofizability admin tools.

Current `v5.330` behavior:

- Production signatureproofizability rollout readiness validates signatureproofizability coverage and readiness through `GET /api/signatureproofizability/readiness`.
- Workspace owners and admins can inspect workspace signatureproofizability metrics from `GET /api/signatureproofizability/workspace/:workspaceId/admin`.
- The web billing panel shows signatureproofizability rollout checks and workspace signatureproofizability admin tools.

Current `v5.330` behavior:

- Production tamperproofizability rollout readiness validates tamperproofizability coverage and readiness through `GET /api/tamperproofizability/readiness`.
- Workspace owners and admins can inspect workspace tamperproofizability metrics from `GET /api/tamperproofizability/workspace/:workspaceId/admin`.
- The web billing panel shows tamperproofizability rollout checks and workspace tamperproofizability admin tools.

Current `v5.330` behavior:

- Production complianceproofizability rollout readiness validates complianceproofizability coverage and readiness through `GET /api/complianceproofizability/readiness`.
- Workspace owners and admins can inspect workspace complianceproofizability metrics from `GET /api/complianceproofizability/workspace/:workspaceId/admin`.
- The web billing panel shows complianceproofizability rollout checks and workspace complianceproofizability admin tools.

Current `v5.330` behavior:

- Production complianceguardizability rollout readiness validates complianceguardizability coverage and readiness through `GET /api/complianceguardizability/readiness`.
- Workspace owners and admins can inspect workspace complianceguardizability metrics from `GET /api/complianceguardizability/workspace/:workspaceId/admin`.
- The web billing panel shows complianceguardizability rollout checks and workspace complianceguardizability admin tools.

Current `v5.330` behavior:

- Production zerotrustizability rollout readiness validates zerotrustizability coverage and readiness through `GET /api/zerotrustizability/readiness`.
- Workspace owners and admins can inspect workspace zerotrustizability metrics from `GET /api/zerotrustizability/workspace/:workspaceId/admin`.
- The web billing panel shows zerotrustizability rollout checks and workspace zerotrustizability admin tools.

Current `v5.330` behavior:

- Production segregationizability rollout readiness validates segregationizability coverage and readiness through `GET /api/segregationizability/readiness`.
- Workspace owners and admins can inspect workspace segregationizability metrics from `GET /api/segregationizability/workspace/:workspaceId/admin`.
- The web billing panel shows segregationizability rollout checks and workspace segregationizability admin tools.

Current `v5.330` behavior:

- Production integrityizability rollout readiness validates integrityizability coverage and readiness through `GET /api/integrityizability/readiness`.
- Workspace owners and admins can inspect workspace integrityizability metrics from `GET /api/integrityizability/workspace/:workspaceId/admin`.
- The web billing panel shows integrityizability rollout checks and workspace integrityizability admin tools.

Current `v5.330` behavior:

- Production identityizability rollout readiness validates identityizability coverage and readiness through `GET /api/identityizability/readiness`.
- Workspace owners and admins can inspect workspace identityizability metrics from `GET /api/identityizability/workspace/:workspaceId/admin`.
- The web billing panel shows identityizability rollout checks and workspace identityizability admin tools.

Current `v5.330` behavior:

- Production controlizability rollout readiness validates controlizability coverage and readiness through `GET /api/controlizability/readiness`.
- Workspace owners and admins can inspect workspace controlizability metrics from `GET /api/controlizability/workspace/:workspaceId/admin`.
- The web billing panel shows controlizability rollout checks and workspace controlizability admin tools.

Current `v5.330` behavior:

- Production telemetryizability rollout readiness validates telemetryizability coverage and readiness through `GET /api/telemetryizability/readiness`.
- Workspace owners and admins can inspect workspace telemetryizability metrics from `GET /api/telemetryizability/workspace/:workspaceId/admin`.
- The web billing panel shows telemetryizability rollout checks and workspace telemetryizability admin tools.

Current `v5.330` behavior:

- Production attestationizability rollout readiness validates attestationizability coverage and readiness through `GET /api/attestationizability/readiness`.
- Workspace owners and admins can inspect workspace attestationizability metrics from `GET /api/attestationizability/workspace/:workspaceId/admin`.
- The web billing panel shows attestationizability rollout checks and workspace attestationizability admin tools.

Current `v5.330` behavior:

- Production governanceizability rollout readiness validates governanceizability coverage and readiness through `GET /api/governanceizability/readiness`.
- Workspace owners and admins can inspect workspace governanceizability metrics from `GET /api/governanceizability/workspace/:workspaceId/admin`.
- The web billing panel shows governanceizability rollout checks and workspace governanceizability admin tools.

Current `v5.330` behavior:

- Production deallocationizability rollout readiness validates deallocationizability coverage and readiness through `GET /api/deallocationizability/readiness`.
- Workspace owners and admins can inspect workspace deallocationizability metrics from `GET /api/deallocationizability/workspace/:workspaceId/admin`.
- The web billing panel shows deallocationizability rollout checks and workspace deallocationizability admin tools.

Current `v5.225` behavior:

- Production meshingizability rollout readiness validates meshingizability coverage and readiness through `GET /api/meshingizability/readiness`.
- Workspace owners and admins can inspect workspace meshingizability metrics from `GET /api/meshingizability/workspace/:workspaceId/admin`.
- The web billing panel shows meshingizability rollout checks and workspace meshingizability admin tools.

Current `v5.330` behavior:

- Production balancingizability rollout readiness validates balancingizability coverage and readiness through `GET /api/balancingizability/readiness`.
- Workspace owners and admins can inspect workspace balancingizability metrics from `GET /api/balancingizability/workspace/:workspaceId/admin`.
- The web billing panel shows balancingizability rollout checks and workspace balancingizability admin tools.

Current `v5.225` behavior:

- Production windowizability rollout readiness validates windowizability coverage and readiness through `GET /api/windowizability/readiness`.
- Workspace owners and admins can inspect workspace windowizability metrics from `GET /api/windowizability/workspace/:workspaceId/admin`.
- The web billing panel shows windowizability rollout checks and workspace windowizability admin tools.

Current `v5.330` behavior:

- Production scanizability rollout readiness validates scanizability coverage and readiness through `GET /api/scanizability/readiness`.
- Workspace owners and admins can inspect workspace scanizability metrics from `GET /api/scanizability/workspace/:workspaceId/admin`.
- The web billing panel shows scanizability rollout checks and workspace scanizability admin tools.

Current `v5.225` behavior:

- Production projectizability rollout readiness validates projectizability coverage and readiness through `GET /api/projectizability/readiness`.
- Workspace owners and admins can inspect workspace projectizability metrics from `GET /api/projectizability/workspace/:workspaceId/admin`.
- The web billing panel shows projectizability rollout checks and workspace projectizability admin tools.

Current `v5.330` behavior:

- Production pivotizability rollout readiness validates pivotizability coverage and readiness through `GET /api/pivotizability/readiness`.
- Workspace owners and admins can inspect workspace pivotizability metrics from `GET /api/pivotizability/workspace/:workspaceId/admin`.
- The web billing panel shows pivotizability rollout checks and workspace pivotizability admin tools.

Current `v5.225` behavior:

- Production retentionizability rollout readiness validates retentionizability coverage and readiness through `GET /api/retentionizability/readiness`.
- Workspace owners and admins can inspect workspace retentionizability metrics from `GET /api/retentionizability/workspace/:workspaceId/admin`.
- The web billing panel shows retentionizability rollout checks and workspace retentionizability admin tools.

Current `v5.330` behavior:

- Production indexingizability rollout readiness validates indexingizability coverage and readiness through `GET /api/indexingizability/readiness`.
- Workspace owners and admins can inspect workspace indexingizability metrics from `GET /api/indexingizability/workspace/:workspaceId/admin`.
- The web billing panel shows indexingizability rollout checks and workspace indexingizability admin tools.

Current `v5.225` behavior:

- Production archiveizability rollout readiness validates archiveizability coverage and readiness through `GET /api/archiveizability/readiness`.
- Workspace owners and admins can inspect workspace archiveizability metrics from `GET /api/archiveizability/workspace/:workspaceId/admin`.
- The web billing panel shows archiveizability rollout checks and workspace archiveizability admin tools.

Current `v5.330` behavior:

- Production cacheizability rollout readiness validates cacheizability coverage and readiness through `GET /api/cacheizability/readiness`.
- Workspace owners and admins can inspect workspace cacheizability metrics from `GET /api/cacheizability/workspace/:workspaceId/admin`.
- The web billing panel shows cacheizability rollout checks and workspace cacheizability admin tools.

Current `v5.225` behavior:

- Production expirationizability rollout readiness validates expirationizability coverage and readiness through `GET /api/expirationizability/readiness`.
- Workspace owners and admins can inspect workspace expirationizability metrics from `GET /api/expirationizability/workspace/:workspaceId/admin`.
- The web billing panel shows expirationizability rollout checks and workspace expirationizability admin tools.

Current `v5.330` behavior:

- Production materializationizability rollout readiness validates materializationizability coverage and readiness through `GET /api/materializationizability/readiness`.
- Workspace owners and admins can inspect workspace materializationizability metrics from `GET /api/materializationizability/workspace/:workspaceId/admin`.
- The web billing panel shows materializationizability rollout checks and workspace materializationizability admin tools.

Current `v5.225` behavior:

- Production walizability rollout readiness validates walizability coverage and readiness through `GET /api/walizability/readiness`.
- Workspace owners and admins can inspect workspace walizability metrics from `GET /api/walizability/workspace/:workspaceId/admin`.
- The web billing panel shows walizability rollout checks and workspace walizability admin tools.

Current `v5.330` behavior:

- Production consensusizability rollout readiness validates consensusizability coverage and readiness through `GET /api/consensusizability/readiness`.
- Workspace owners and admins can inspect workspace consensusizability metrics from `GET /api/consensusizability/workspace/:workspaceId/admin`.
- The web billing panel shows consensusizability rollout checks and workspace consensusizability admin tools.

Current `v5.225` behavior:

- Production recoveryizability rollout readiness validates recoveryizability coverage and readiness through `GET /api/recoveryizability/readiness`.
- Workspace owners and admins can inspect workspace recoveryizability metrics from `GET /api/recoveryizability/workspace/:workspaceId/admin`.
- The web billing panel shows recoveryizability rollout checks and workspace recoveryizability admin tools.

Current `v5.330` behavior:

- Production sequencizability rollout readiness validates sequencizability coverage and readiness through `GET /api/sequencizability/readiness`.
- Workspace owners and admins can inspect workspace sequencizability metrics from `GET /api/sequencizability/workspace/:workspaceId/admin`.
- The web billing panel shows sequencizability rollout checks and workspace sequencizability admin tools.

Current `v5.225` behavior:

- Production timeoutizability rollout readiness validates timeoutizability coverage and readiness through `GET /api/timeoutizability/readiness`.
- Workspace owners and admins can inspect workspace timeoutizability metrics from `GET /api/timeoutizability/workspace/:workspaceId/admin`.
- The web billing panel shows timeoutizability rollout checks and workspace timeoutizability admin tools.

Current `v5.330` behavior:

- Production debouncizability rollout readiness validates debouncizability coverage and readiness through `GET /api/debouncizability/readiness`.
- Workspace owners and admins can inspect workspace debouncizability metrics from `GET /api/debouncizability/workspace/:workspaceId/admin`.
- The web billing panel shows debouncizability rollout checks and workspace debouncizability admin tools.

Current `v5.225` behavior:

- Production multicastizability rollout readiness validates multicastizability coverage and readiness through `GET /api/multicastizability/readiness`.
- Workspace owners and admins can inspect workspace multicastizability metrics from `GET /api/multicastizability/workspace/:workspaceId/admin`.
- The web billing panel shows multicastizability rollout checks and workspace multicastizability admin tools.

Current `v5.330` behavior:

- Production dispatchizability rollout readiness validates dispatchizability coverage and readiness through `GET /api/dispatchizability/readiness`.
- Workspace owners and admins can inspect workspace dispatchizability metrics from `GET /api/dispatchizability/workspace/:workspaceId/admin`.
- The web billing panel shows dispatchizability rollout checks and workspace dispatchizability admin tools.

Current `v5.225` behavior:

- Production notifizability rollout readiness validates notifizability coverage and readiness through `GET /api/notifizability/readiness`.
- Workspace owners and admins can inspect workspace notifizability metrics from `GET /api/notifizability/workspace/:workspaceId/admin`.
- The web billing panel shows notifizability rollout checks and workspace notifizability admin tools.

Current `v5.330` behavior:

- Production relayizability rollout readiness validates relayizability coverage and readiness through `GET /api/relayizability/readiness`.
- Workspace owners and admins can inspect workspace relayizability metrics from `GET /api/relayizability/workspace/:workspaceId/admin`.
- The web billing panel shows relayizability rollout checks and workspace relayizability admin tools.

Current `v5.225` behavior:

- Production meshabilizability rollout readiness validates meshabilizability coverage and readiness through `GET /api/meshabilizability/readiness`.
- Workspace owners and admins can inspect workspace meshabilizability metrics from `GET /api/meshabilizability/workspace/:workspaceId/admin`.
- The web billing panel shows meshabilizability rollout checks and workspace meshabilizability admin tools.

Current `v5.339` behavior:

- Production decentralizability rollout readiness validates decentralizability coverage and readiness through `GET /api/decentralizability/readiness`.
- Workspace owners and admins can inspect workspace decentralizability metrics from `GET /api/decentralizability/workspace/:workspaceId/admin`.
- The web billing panel shows decentralizability rollout checks and workspace decentralizability admin tools.

Current `v5.338` behavior:

- Production federatizability rollout readiness validates federatizability coverage and readiness through `GET /api/federatizability/readiness`.
- Workspace owners and admins can inspect workspace federatizability metrics from `GET /api/federatizability/workspace/:workspaceId/admin`.
- The web billing panel shows federatizability rollout checks and workspace federatizability admin tools.

Current `v5.337` behavior:

- Production distributizability rollout readiness validates distributizability coverage and readiness through `GET /api/distributizability/readiness`.
- Workspace owners and admins can inspect workspace distributizability metrics from `GET /api/distributizability/workspace/:workspaceId/admin`.
- The web billing panel shows distributizability rollout checks and workspace distributizability admin tools.

Current `v5.336` behavior:

- Production virtualizability rollout readiness validates virtualizability coverage and readiness through `GET /api/virtualizability/readiness`.
- Workspace owners and admins can inspect workspace virtualizability metrics from `GET /api/virtualizability/workspace/:workspaceId/admin`.
- The web billing panel shows virtualizability rollout checks and workspace virtualizability admin tools.

Current `v5.225` behavior:

- Production registryizability rollout readiness validates registryizability coverage and readiness through `GET /api/registryizability/readiness`.
- Workspace owners and admins can inspect workspace registryizability metrics from `GET /api/registryizability/workspace/:workspaceId/admin`.
- The web billing panel shows registryizability rollout checks and workspace registryizability admin tools.

Current `v5.224` behavior:

- Production inventoryizability rollout readiness validates inventoryizability coverage and readiness through `GET /api/inventoryizability/readiness`.
- Workspace owners and admins can inspect workspace inventoryizability metrics from `GET /api/inventoryizability/workspace/:workspaceId/admin`.
- The web billing panel shows inventoryizability rollout checks and workspace inventoryizability admin tools.

Current `v5.223` behavior:

- Production directoryizability rollout readiness validates directoryizability coverage and readiness through `GET /api/directoryizability/readiness`.
- Workspace owners and admins can inspect workspace directoryizability metrics from `GET /api/directoryizability/workspace/:workspaceId/admin`.
- The web billing panel shows directoryizability rollout checks and workspace directoryizability admin tools.

Current `v5.222` behavior:

- Production indexizability rollout readiness validates indexizability coverage and readiness through `GET /api/indexizability/readiness`.
- Workspace owners and admins can inspect workspace indexizability metrics from `GET /api/indexizability/workspace/:workspaceId/admin`.
- The web billing panel shows indexizability rollout checks and workspace indexizability admin tools.

Current `v5.221` behavior:

- Production catalogizability rollout readiness validates catalogizability coverage and readiness through `GET /api/catalogizability/readiness`.
- Workspace owners and admins can inspect workspace catalogizability metrics from `GET /api/catalogizability/workspace/:workspaceId/admin`.
- The web billing panel shows catalogizability rollout checks and workspace catalogizability admin tools.

Current `v5.220` behavior:

- Production nomenclatizability rollout readiness validates nomenclatizability coverage and readiness through `GET /api/nomenclatizability/readiness`.
- Workspace owners and admins can inspect workspace nomenclatizability metrics from `GET /api/nomenclatizability/workspace/:workspaceId/admin`.
- The web billing panel shows nomenclatizability rollout checks and workspace nomenclatizability admin tools.

Current `v5.219` behavior:

- Production clusterizability rollout readiness validates clusterizability coverage and readiness through `GET /api/clusterizability/readiness`.
- Workspace owners and admins can inspect workspace clusterizability metrics from `GET /api/clusterizability/workspace/:workspaceId/admin`.
- The web billing panel shows clusterizability rollout checks and workspace clusterizability admin tools.

Current `v5.218` behavior:

- Production segmentizability rollout readiness validates segmentizability coverage and readiness through `GET /api/segmentizability/readiness`.
- Workspace owners and admins can inspect workspace segmentizability metrics from `GET /api/segmentizability/workspace/:workspaceId/admin`.
- The web billing panel shows segmentizability rollout checks and workspace segmentizability admin tools.

Current `v5.217` behavior:

- Production hierarchizability rollout readiness validates hierarchizability coverage and readiness through `GET /api/hierarchizability/readiness`.
- Workspace owners and admins can inspect workspace hierarchizability metrics from `GET /api/hierarchizability/workspace/:workspaceId/admin`.
- The web billing panel shows hierarchizability rollout checks and workspace hierarchizability admin tools.

Current `v5.216` behavior:

- Production systematizability rollout readiness validates systematizability coverage and readiness through `GET /api/systematizability/readiness`.
- Workspace owners and admins can inspect workspace systematizability metrics from `GET /api/systematizability/workspace/:workspaceId/admin`.
- The web billing panel shows systematizability rollout checks and workspace systematizability admin tools.

Current `v5.215` behavior:

- Production ordinarizability rollout readiness validates ordinarizability coverage and readiness through `GET /api/ordinarizability/readiness`.
- Workspace owners and admins can inspect workspace ordinarizability metrics from `GET /api/ordinarizability/workspace/:workspaceId/admin`.
- The web billing panel shows ordinarizability rollout checks and workspace ordinarizability admin tools.

Current `v5.214` behavior:

- Production stratifiability rollout readiness validates stratifiability coverage and readiness through `GET /api/stratifiability/readiness`.
- Workspace owners and admins can inspect workspace stratifiability metrics from `GET /api/stratifiability/workspace/:workspaceId/admin`.
- The web billing panel shows stratifiability rollout checks and workspace stratifiability admin tools.

Current `v5.213` behavior:

- Production typologizability rollout readiness validates typologizability coverage and readiness through `GET /api/typologizability/readiness`.
- Workspace owners and admins can inspect workspace typologizability metrics from `GET /api/typologizability/workspace/:workspaceId/admin`.
- The web billing panel shows typologizability rollout checks and workspace typologizability admin tools.

Current `v5.212` behavior:

- Production classifiability rollout readiness validates classifiability coverage and readiness through `GET /api/classifiability/readiness`.
- Workspace owners and admins can inspect workspace classifiability metrics from `GET /api/classifiability/workspace/:workspaceId/admin`.
- The web billing panel shows classifiability rollout checks and workspace classifiability admin tools.

Current `v5.211` behavior:

- Production taxonomizability rollout readiness validates taxonomizability coverage and readiness through `GET /api/taxonomizability/readiness`.
- Workspace owners and admins can inspect workspace taxonomizability metrics from `GET /api/taxonomizability/workspace/:workspaceId/admin`.
- The web billing panel shows taxonomizability rollout checks and workspace taxonomizability admin tools.

Current `v5.210` behavior:

- Production categorizability rollout readiness validates categorizability coverage and readiness through `GET /api/categorizability/readiness`.
- Workspace owners and admins can inspect workspace categorizability metrics from `GET /api/categorizability/workspace/:workspaceId/admin`.
- The web billing panel shows categorizability rollout checks and workspace categorizability admin tools.

Current `v5.209` behavior:

- Production historizability rollout readiness validates historizability coverage and readiness through `GET /api/historizability/readiness`.
- Workspace owners and admins can inspect workspace historizability metrics from `GET /api/historizability/workspace/:workspaceId/admin`.
- The web billing panel shows historizability rollout checks and workspace historizability admin tools.

Current `v5.208` behavior:

- Production methodizability rollout readiness validates methodizability coverage and readiness through `GET /api/methodizability/readiness`.
- Workspace owners and admins can inspect workspace methodizability metrics from `GET /api/methodizability/workspace/:workspaceId/admin`.
- The web billing panel shows methodizability rollout checks and workspace methodizability admin tools.

Current `v5.207` behavior:

- Production gnoseizability rollout readiness validates gnoseizability coverage and readiness through `GET /api/gnoseizability/readiness`.
- Workspace owners and admins can inspect workspace gnoseizability metrics from `GET /api/gnoseizability/workspace/:workspaceId/admin`.
- The web billing panel shows gnoseizability rollout checks and workspace gnoseizability admin tools.

Current `v5.206` behavior:

- Production teleologizability rollout readiness validates teleologizability coverage and readiness through `GET /api/teleologizability/readiness`.
- Workspace owners and admins can inspect workspace teleologizability metrics from `GET /api/teleologizability/workspace/:workspaceId/admin`.
- The web billing panel shows teleologizability rollout checks and workspace teleologizability admin tools.

Current `v5.205` behavior:

- Production axiologizability rollout readiness validates axiologizability coverage and readiness through `GET /api/axiologizability/readiness`.
- Workspace owners and admins can inspect workspace axiologizability metrics from `GET /api/axiologizability/workspace/:workspaceId/admin`.
- The web billing panel shows axiologizability rollout checks and workspace axiologizability admin tools.

Current `v5.204` behavior:

- Production phenomenizability rollout readiness validates phenomenizability coverage and readiness through `GET /api/phenomenizability/readiness`.
- Workspace owners and admins can inspect workspace phenomenizability metrics from `GET /api/phenomenizability/workspace/:workspaceId/admin`.
- The web billing panel shows phenomenizability rollout checks and workspace phenomenizability admin tools.

Current `v5.203` behavior:

- Production ontologizability rollout readiness validates ontologizability coverage and readiness through `GET /api/ontologizability/readiness`.
- Workspace owners and admins can inspect workspace ontologizability metrics from `GET /api/ontologizability/workspace/:workspaceId/admin`.
- The web billing panel shows ontologizability rollout checks and workspace ontologizability admin tools.

Current `v5.202` behavior:

- Production dialectizability rollout readiness validates dialectizability coverage and readiness through `GET /api/dialectizability/readiness`.
- Workspace owners and admins can inspect workspace dialectizability metrics from `GET /api/dialectizability/workspace/:workspaceId/admin`.
- The web billing panel shows dialectizability rollout checks and workspace dialectizability admin tools.

Current `v5.201` behavior:

- Production epistemizability rollout readiness validates epistemizability coverage and readiness through `GET /api/epistemizability/readiness`.
- Workspace owners and admins can inspect workspace epistemizability metrics from `GET /api/epistemizability/workspace/:workspaceId/admin`.
- The web billing panel shows epistemizability rollout checks and workspace epistemizability admin tools.

Current `v5.200` behavior:

- Production hermeticizability rollout readiness validates hermeticizability coverage and readiness through `GET /api/hermeticizability/readiness`.
- Workspace owners and admins can inspect workspace hermeticizability metrics from `GET /api/hermeticizability/workspace/:workspaceId/admin`.
- The web billing panel shows hermeticizability rollout checks and workspace hermeticizability admin tools.

Current `v5.199` behavior:

- Production codifiability rollout readiness validates codifiability coverage and readiness through `GET /api/codifiability/readiness`.
- Workspace owners and admins can inspect workspace codifiability metrics from `GET /api/codifiability/workspace/:workspaceId/admin`.
- The web billing panel shows codifiability rollout checks and workspace codifiability admin tools.

Current `v5.198` behavior:

- Production morphizability rollout readiness validates morphizability coverage and readiness through `GET /api/morphizability/readiness`.
- Workspace owners and admins can inspect workspace morphizability metrics from `GET /api/morphizability/workspace/:workspaceId/admin`.
- The web billing panel shows morphizability rollout checks and workspace morphizability admin tools.

Current `v5.197` behavior:

- Production rhetorizability rollout readiness validates rhetorizability coverage and readiness through `GET /api/rhetorizability/readiness`.
- Workspace owners and admins can inspect workspace rhetorizability metrics from `GET /api/rhetorizability/workspace/:workspaceId/admin`.
- The web billing panel shows rhetorizability rollout checks and workspace rhetorizability admin tools.

Current `v5.196` behavior:

- Production syntacticizability rollout readiness validates syntacticizability coverage and readiness through `GET /api/syntacticizability/readiness`.
- Workspace owners and admins can inspect workspace syntacticizability metrics from `GET /api/syntacticizability/workspace/:workspaceId/admin`.
- The web billing panel shows syntacticizability rollout checks and workspace syntacticizability admin tools.

Current `v5.195` behavior:

- Production pragmatizability rollout readiness validates pragmatizability coverage and readiness through `GET /api/pragmatizability/readiness`.
- Workspace owners and admins can inspect workspace pragmatizability metrics from `GET /api/pragmatizability/workspace/:workspaceId/admin`.
- The web billing panel shows pragmatizability rollout checks and workspace pragmatizability admin tools.

Current `v5.194` behavior:

- Production semanticizability rollout readiness validates semanticizability coverage and readiness through `GET /api/semanticizability/readiness`.
- Workspace owners and admins can inspect workspace semanticizability metrics from `GET /api/semanticizability/workspace/:workspaceId/admin`.
- The web billing panel shows semanticizability rollout checks and workspace semanticizability admin tools.

Current `v5.193` behavior:

- Production lexicalizability rollout readiness validates lexicalizability coverage and readiness through `GET /api/lexicalizability/readiness`.
- Workspace owners and admins can inspect workspace lexicalizability metrics from `GET /api/lexicalizability/workspace/:workspaceId/admin`.
- The web billing panel shows lexicalizability rollout checks and workspace lexicalizability admin tools.

Current `v5.192` behavior:

- Production hermeneutizability rollout readiness validates hermeneutizability coverage and readiness through `GET /api/hermeneutizability/readiness`.
- Workspace owners and admins can inspect workspace hermeneutizability metrics from `GET /api/hermeneutizability/workspace/:workspaceId/admin`.
- The web billing panel shows hermeneutizability rollout checks and workspace hermeneutizability admin tools.

Current `v5.191` behavior:

- Production semiotizability rollout readiness validates semiotizability coverage and readiness through `GET /api/semiotizability/readiness`.
- Workspace owners and admins can inspect workspace semiotizability metrics from `GET /api/semiotizability/workspace/:workspaceId/admin`.
- The web billing panel shows semiotizability rollout checks and workspace semiotizability admin tools.

Current `v5.190` behavior:

- Production mythicizability rollout readiness validates mythicizability coverage and readiness through `GET /api/mythicizability/readiness`.
- Workspace owners and admins can inspect workspace mythicizability metrics from `GET /api/mythicizability/workspace/:workspaceId/admin`.
- The web billing panel shows mythicizability rollout checks and workspace mythicizability admin tools.

Current `v5.189` behavior:

- Production caracterizability rollout readiness validates caracterizability coverage and readiness through `GET /api/caracterizability/readiness`.
- Workspace owners and admins can inspect workspace caracterizability metrics from `GET /api/caracterizability/workspace/:workspaceId/admin`.
- The web billing panel shows caracterizability rollout checks and workspace caracterizability admin tools.

Current `v5.188` behavior:

- Production archetypizability rollout readiness validates archetypizability coverage and readiness through `GET /api/archetypizability/readiness`.
- Workspace owners and admins can inspect workspace archetypizability metrics from `GET /api/archetypizability/workspace/:workspaceId/admin`.
- The web billing panel shows archetypizability rollout checks and workspace archetypizability admin tools.

Current `v5.187` behavior:

- Production parabolizability rollout readiness validates parabolizability coverage and readiness through `GET /api/parabolizability/readiness`.
- Workspace owners and admins can inspect workspace parabolizability metrics from `GET /api/parabolizability/workspace/:workspaceId/admin`.
- The web billing panel shows parabolizability rollout checks and workspace parabolizability admin tools.

Current `v5.186` behavior:

- Production analogizability rollout readiness validates analogizability coverage and readiness through `GET /api/analogizability/readiness`.
- Workspace owners and admins can inspect workspace analogizability metrics from `GET /api/analogizability/workspace/:workspaceId/admin`.
- The web billing panel shows analogizability rollout checks and workspace analogizability admin tools.

Current `v5.185` behavior:

- Production emblemizability rollout readiness validates emblemizability coverage and readiness through `GET /api/emblemizability/readiness`.
- Workspace owners and admins can inspect workspace emblemizability metrics from `GET /api/emblemizability/workspace/:workspaceId/admin`.
- The web billing panel shows emblemizability rollout checks and workspace emblemizability admin tools.

Current `v5.184` behavior:

- Production stylizability rollout readiness validates stylizability coverage and readiness through `GET /api/stylizability/readiness`.
- Workspace owners and admins can inspect workspace stylizability metrics from `GET /api/stylizability/workspace/:workspaceId/admin`.
- The web billing panel shows stylizability rollout checks and workspace stylizability admin tools.

Current `v5.183` behavior:

- Production tokenizability rollout readiness validates tokenizability coverage and readiness through `GET /api/tokenizability/readiness`.
- Workspace owners and admins can inspect workspace tokenizability metrics from `GET /api/tokenizability/workspace/:workspaceId/admin`.
- The web billing panel shows tokenizability rollout checks and workspace tokenizability admin tools.

Current `v5.182` behavior:

- Production allegorizability rollout readiness validates allegorizability coverage and readiness through `GET /api/allegorizability/readiness`.
- Workspace owners and admins can inspect workspace allegorizability metrics from `GET /api/allegorizability/workspace/:workspaceId/admin`.
- The web billing panel shows allegorizability rollout checks and workspace allegorizability admin tools.

Current `v5.181` behavior:

- Production iconizability rollout readiness validates iconizability coverage and readiness through `GET /api/iconizability/readiness`.
- Workspace owners and admins can inspect workspace iconizability metrics from `GET /api/iconizability/workspace/:workspaceId/admin`.
- The web billing panel shows iconizability rollout checks and workspace iconizability admin tools.

Current `v5.180` behavior:

- Production materializability rollout readiness validates materializability coverage and readiness through `GET /api/materializability/readiness`.
- Workspace owners and admins can inspect workspace materializability metrics from `GET /api/materializability/workspace/:workspaceId/admin`.
- The web billing panel shows materializability rollout checks and workspace materializability admin tools.

Current `v5.179` behavior:

- Production personifiability rollout readiness validates personifiability coverage and readiness through `GET /api/personifiability/readiness`.
- Workspace owners and admins can inspect workspace personifiability metrics from `GET /api/personifiability/workspace/:workspaceId/admin`.
- The web billing panel shows personifiability rollout checks and workspace personifiability admin tools.

Current `v5.178` behavior:

- Production dramatizability rollout readiness validates dramatizability coverage and readiness through `GET /api/dramatizability/readiness`.
- Workspace owners and admins can inspect workspace dramatizability metrics from `GET /api/dramatizability/workspace/:workspaceId/admin`.
- The web billing panel shows dramatizability rollout checks and workspace dramatizability admin tools.

Current `v5.177` behavior:

- Production metaphorizability rollout readiness validates metaphorizability coverage and readiness through `GET /api/metaphorizability/readiness`.
- Workspace owners and admins can inspect workspace metaphorizability metrics from `GET /api/metaphorizability/workspace/:workspaceId/admin`.
- The web billing panel shows metaphorizability rollout checks and workspace metaphorizability admin tools.

Current `v5.176` behavior:

- Production typifiability rollout readiness validates typifiability coverage and readiness through `GET /api/typifiability/readiness`.
- Workspace owners and admins can inspect workspace typifiability metrics from `GET /api/typifiability/workspace/:workspaceId/admin`.
- The web billing panel shows typifiability rollout checks and workspace typifiability admin tools.

Current `v5.175` behavior:

- Production connotability rollout readiness validates connotability coverage and readiness through `GET /api/connotability/readiness`.
- Workspace owners and admins can inspect workspace connotability metrics from `GET /api/connotability/workspace/:workspaceId/admin`.
- The web billing panel shows connotability rollout checks and workspace connotability admin tools.

Current `v5.174` behavior:

- Production signifiability rollout readiness validates signifiability coverage and readiness through `GET /api/signifiability/readiness`.
- Workspace owners and admins can inspect workspace signifiability metrics from `GET /api/signifiability/workspace/:workspaceId/admin`.
- The web billing panel shows signifiability rollout checks and workspace signifiability admin tools.

Current `v5.173` behavior:

- Production evocatability rollout readiness validates evocatability coverage and readiness through `GET /api/evocatability/readiness`.
- Workspace owners and admins can inspect workspace evocatability metrics from `GET /api/evocatability/workspace/:workspaceId/admin`.
- The web billing panel shows evocatability rollout checks and workspace evocatability admin tools.

Current `v5.172` behavior:

- Production visualizability rollout readiness validates visualizability coverage and readiness through `GET /api/visualizability/readiness`.
- Workspace owners and admins can inspect workspace visualizability metrics from `GET /api/visualizability/workspace/:workspaceId/admin`.
- The web billing panel shows visualizability rollout checks and workspace visualizability admin tools.

Current `v5.171` behavior:

- Production symbolizability rollout readiness validates symbolizability coverage and readiness through `GET /api/symbolizability/readiness`.
- Workspace owners and admins can inspect workspace symbolizability metrics from `GET /api/symbolizability/workspace/:workspaceId/admin`.
- The web billing panel shows symbolizability rollout checks and workspace symbolizability admin tools.

Current `v5.170` behavior:

- Production illustratability rollout readiness validates illustratability coverage and readiness through `GET /api/illustratability/readiness`.
- Workspace owners and admins can inspect workspace illustratability metrics from `GET /api/illustratability/workspace/:workspaceId/admin`.
- The web billing panel shows illustratability rollout checks and workspace illustratability admin tools.

Current `v5.169` behavior:

- Production narratability rollout readiness validates narratability coverage and readiness through `GET /api/narratability/readiness`.
- Workspace owners and admins can inspect workspace narratability metrics from `GET /api/narratability/workspace/:workspaceId/admin`.
- The web billing panel shows narratability rollout checks and workspace narratability admin tools.

Current `v5.168` behavior:

- Production formulatability rollout readiness validates formulatability coverage and readiness through `GET /api/formulatability/readiness`.
- Workspace owners and admins can inspect workspace formulatability metrics from `GET /api/formulatability/workspace/:workspaceId/admin`.
- The web billing panel shows formulatability rollout checks and workspace formulatability admin tools.

Current `v5.167` behavior:

- Production enunciability rollout readiness validates enunciability coverage and readiness through `GET /api/enunciability/readiness`.
- Workspace owners and admins can inspect workspace enunciability metrics from `GET /api/enunciability/workspace/:workspaceId/admin`.
- The web billing panel shows enunciability rollout checks and workspace enunciability admin tools.

Current `v5.166` behavior:

- Production presentability rollout readiness validates presentability coverage and readiness through `GET /api/presentability/readiness`.
- Workspace owners and admins can inspect workspace presentability metrics from `GET /api/presentability/workspace/:workspaceId/admin`.
- The web billing panel shows presentability rollout checks and workspace presentability admin tools.

Current `v5.165` behavior:

- Production representability rollout readiness validates representability coverage and readiness through `GET /api/representability/readiness`.
- Workspace owners and admins can inspect workspace representability metrics from `GET /api/representability/workspace/:workspaceId/admin`.
- The web billing panel shows representability rollout checks and workspace representability admin tools.

Current `v5.164` behavior:

- Production elaboratability rollout readiness validates elaboratability coverage and readiness through `GET /api/elaboratability/readiness`.
- Workspace owners and admins can inspect workspace elaboratability metrics from `GET /api/elaboratability/workspace/:workspaceId/admin`.
- The web billing panel shows elaboratability rollout checks and workspace elaboratability admin tools.

Current `v5.163` behavior:

- Production articulability rollout readiness validates articulability coverage and readiness through `GET /api/articulability/readiness`.
- Workspace owners and admins can inspect workspace articulability metrics from `GET /api/articulability/workspace/:workspaceId/admin`.
- The web billing panel shows articulability rollout checks and workspace articulability admin tools.

Current `v5.162` behavior:

- Production communicability rollout readiness validates communicability coverage and readiness through `GET /api/communicability/readiness`.
- Workspace owners and admins can inspect workspace communicability metrics from `GET /api/communicability/workspace/:workspaceId/admin`.
- The web billing panel shows communicability rollout checks and workspace communicability admin tools.

Current `v5.161` behavior:

- Production expressiveness rollout readiness validates expressiveness coverage and readiness through `GET /api/expressiveness/readiness`.
- Workspace owners and admins can inspect workspace expressiveness metrics from `GET /api/expressiveness/workspace/:workspaceId/admin`.
- The web billing panel shows expressiveness rollout checks and workspace expressiveness admin tools.

Current `v5.160` behavior:

- Production describability rollout readiness validates describability coverage and readiness through `GET /api/describability/readiness`.
- Workspace owners and admins can inspect workspace describability metrics from `GET /api/describability/workspace/:workspaceId/admin`.
- The web billing panel shows describability rollout checks and workspace describability admin tools.

Current `v5.159` behavior:

- Production detectability rollout readiness validates detectability coverage and readiness through `GET /api/detectability/readiness`.
- Workspace owners and admins can inspect workspace detectability metrics from `GET /api/detectability/workspace/:workspaceId/admin`.
- The web billing panel shows detectability rollout checks and workspace detectability admin tools.

Current `v5.158` behavior:

- Production conspicuousness rollout readiness validates conspicuousness coverage and readiness through `GET /api/conspicuousness/readiness`.
- Workspace owners and admins can inspect workspace conspicuousness metrics from `GET /api/conspicuousness/workspace/:workspaceId/admin`.
- The web billing panel shows conspicuousness rollout checks and workspace conspicuousness admin tools.

Current `v5.157` behavior:

- Production distinctiveness rollout readiness validates distinctiveness coverage and readiness through `GET /api/distinctiveness/readiness`.
- Workspace owners and admins can inspect workspace distinctiveness metrics from `GET /api/distinctiveness/workspace/:workspaceId/admin`.
- The web billing panel shows distinctiveness rollout checks and workspace distinctiveness admin tools.

Current `v5.156` behavior:

- Production discernibility rollout readiness validates discernibility coverage and readiness through `GET /api/discernibility/readiness`.
- Workspace owners and admins can inspect workspace discernibility metrics from `GET /api/discernibility/workspace/:workspaceId/admin`.
- The web billing panel shows discernibility rollout checks and workspace discernibility admin tools.

Current `v5.155` behavior:

- Production noticeability rollout readiness validates noticeability coverage and readiness through `GET /api/noticeability/readiness`.
- Workspace owners and admins can inspect workspace noticeability metrics from `GET /api/noticeability/workspace/:workspaceId/admin`.
- The web billing panel shows noticeability rollout checks and workspace noticeability admin tools.

Current `v5.154` behavior:

- Production perceptibility rollout readiness validates perceptibility coverage and readiness through `GET /api/perceptibility/readiness`.
- Workspace owners and admins can inspect workspace perceptibility metrics from `GET /api/perceptibility/workspace/:workspaceId/admin`.
- The web billing panel shows perceptibility rollout checks and workspace perceptibility admin tools.

Current `v5.153` behavior:

- Production scannability rollout readiness validates scannability coverage and readiness through `GET /api/scannability/readiness`.
- Workspace owners and admins can inspect workspace scannability metrics from `GET /api/scannability/workspace/:workspaceId/admin`.
- The web billing panel shows scannability rollout checks and workspace scannability admin tools.

Current `v5.152` behavior:

- Production interpretability rollout readiness validates interpretability coverage and readiness through `GET /api/interpretability/readiness`.
- Workspace owners and admins can inspect workspace interpretability metrics from `GET /api/interpretability/workspace/:workspaceId/admin`.
- The web billing panel shows interpretability rollout checks and workspace interpretability admin tools.

Current `v5.151` behavior:

- Production recognizability rollout readiness validates recognizability coverage and readiness through `GET /api/recognizability/readiness`.
- Workspace owners and admins can inspect workspace recognizability metrics from `GET /api/recognizability/workspace/:workspaceId/admin`.
- The web billing panel shows recognizability rollout checks and workspace recognizability admin tools.

Current `v5.150` behavior:

- Production familiarity rollout readiness validates familiarity coverage and readiness through `GET /api/familiarity/readiness`.
- Workspace owners and admins can inspect workspace familiarity metrics from `GET /api/familiarity/workspace/:workspaceId/admin`.
- The web billing panel shows familiarity rollout checks and workspace familiarity admin tools.

Current `v5.149` behavior:

- Production coherence rollout readiness validates coherence coverage and readiness through `GET /api/coherence/readiness`.
- Workspace owners and admins can inspect workspace coherence metrics from `GET /api/coherence/workspace/:workspaceId/admin`.
- The web billing panel shows coherence rollout checks and workspace coherence admin tools.

Current `v5.148` behavior:

- Production parsability rollout readiness validates parsability coverage and readiness through `GET /api/parsability/readiness`.
- Workspace owners and admins can inspect workspace parsability metrics from `GET /api/parsability/workspace/:workspaceId/admin`.
- The web billing panel shows parsability rollout checks and workspace parsability admin tools.

Current `v5.147` behavior:

- Production legibility rollout readiness validates legibility coverage and readiness through `GET /api/legibility/readiness`.
- Workspace owners and admins can inspect workspace legibility metrics from `GET /api/legibility/workspace/:workspaceId/admin`.
- The web billing panel shows legibility rollout checks and workspace legibility admin tools.

Current `v5.146` behavior:

- Production intelligibility rollout readiness validates intelligibility coverage and readiness through `GET /api/intelligibility/readiness`.
- Workspace owners and admins can inspect workspace intelligibility metrics from `GET /api/intelligibility/workspace/:workspaceId/admin`.
- The web billing panel shows intelligibility rollout checks and workspace intelligibility admin tools.

Current `v5.145` behavior:

- Production comprehensibility rollout readiness validates comprehensibility coverage and readiness through `GET /api/comprehensibility/readiness`.
- Workspace owners and admins can inspect workspace comprehensibility metrics from `GET /api/comprehensibility/workspace/:workspaceId/admin`.
- The web billing panel shows comprehensibility rollout checks and workspace comprehensibility admin tools.

Current `v5.144` behavior:

- Production negotiability rollout readiness validates negotiability coverage and readiness through `GET /api/negotiability/readiness`.
- Workspace owners and admins can inspect workspace negotiability metrics from `GET /api/negotiability/workspace/:workspaceId/admin`.
- The web billing panel shows negotiability rollout checks and workspace negotiability admin tools.

Current `v5.143` behavior:

- Production simplicity rollout readiness validates simplicity coverage and readiness through `GET /api/simplicity/readiness`.
- Workspace owners and admins can inspect workspace simplicity metrics from `GET /api/simplicity/workspace/:workspaceId/admin`.
- The web billing panel shows simplicity rollout checks and workspace simplicity admin tools.

Current `v5.142` behavior:

- Production clarity rollout readiness validates clarity coverage and readiness through `GET /api/clarity/readiness`.
- Workspace owners and admins can inspect workspace clarity metrics from `GET /api/clarity/workspace/:workspaceId/admin`.
- The web billing panel shows clarity rollout checks and workspace clarity admin tools.

Current `v5.141` behavior:

- Production readability rollout readiness validates readability coverage and readiness through `GET /api/readability/readiness`.
- Workspace owners and admins can inspect workspace readability metrics from `GET /api/readability/workspace/:workspaceId/admin`.
- The web billing panel shows readability rollout checks and workspace readability admin tools.

Current `v5.140` behavior:

- Production teachability rollout readiness validates teachability coverage and readiness through `GET /api/teachability/readiness`.
- Workspace owners and admins can inspect workspace teachability metrics from `GET /api/teachability/workspace/:workspaceId/admin`.
- The web billing panel shows teachability rollout checks and workspace teachability admin tools.

Current `v5.139` behavior:

- Production memorability rollout readiness validates memorability coverage and readiness through `GET /api/memorability/readiness`.
- Workspace owners and admins can inspect workspace memorability metrics from `GET /api/memorability/workspace/:workspaceId/admin`.
- The web billing panel shows memorability rollout checks and workspace memorability admin tools.

Current `v5.138` behavior:

- Production understandability rollout readiness validates understandability coverage and readiness through `GET /api/understandability/readiness`.
- Workspace owners and admins can inspect workspace understandability metrics from `GET /api/understandability/workspace/:workspaceId/admin`.
- The web billing panel shows understandability rollout checks and workspace understandability admin tools.

Current `v5.137` behavior:

- Production deliverability rollout readiness validates deliverability coverage and readiness through `GET /api/deliverability/readiness`.
- Workspace owners and admins can inspect workspace deliverability metrics from `GET /api/deliverability/workspace/:workspaceId/admin`.
- The web billing panel shows deliverability rollout checks and workspace deliverability admin tools.

Current `v5.136` behavior:

- Production learnability rollout readiness validates learnability coverage and readiness through `GET /api/learnability/readiness`.
- Workspace owners and admins can inspect workspace learnability metrics from `GET /api/learnability/workspace/:workspaceId/admin`.
- The web billing panel shows learnability rollout checks and workspace learnability admin tools.

Current `v5.135` behavior:

- Production profitability rollout readiness validates profitability coverage and readiness through `GET /api/profitability/readiness`.
- Workspace owners and admins can inspect workspace profitability metrics from `GET /api/profitability/workspace/:workspaceId/admin`.
- The web billing panel shows profitability rollout checks and workspace profitability admin tools.

Current `v5.134` behavior:

- Production suitability rollout readiness validates suitability coverage and readiness through `GET /api/suitability/readiness`.
- Workspace owners and admins can inspect workspace suitability metrics from `GET /api/suitability/workspace/:workspaceId/admin`.
- The web billing panel shows suitability rollout checks and workspace suitability admin tools.

Current `v5.133` behavior:

- Production marketability rollout readiness validates marketability coverage and readiness through `GET /api/marketability/readiness`.
- Workspace owners and admins can inspect workspace marketability metrics from `GET /api/marketability/workspace/:workspaceId/admin`.
- The web billing panel shows marketability rollout checks and workspace marketability admin tools.

Current `v5.132` behavior:

- Production desirability rollout readiness validates desirability coverage and readiness through `GET /api/desirability/readiness`.
- Workspace owners and admins can inspect workspace desirability metrics from `GET /api/desirability/workspace/:workspaceId/admin`.
- The web billing panel shows desirability rollout checks and workspace desirability admin tools.

Current `v5.131` behavior:

- Production affordability rollout readiness validates affordability coverage and readiness through `GET /api/affordability/readiness`.
- Workspace owners and admins can inspect workspace affordability metrics from `GET /api/affordability/workspace/:workspaceId/admin`.
- The web billing panel shows affordability rollout checks and workspace affordability admin tools.

Current `v5.130` behavior:

- Production acceptability rollout readiness validates acceptability coverage and readiness through `GET /api/acceptability/readiness`.
- Workspace owners and admins can inspect workspace acceptability metrics from `GET /api/acceptability/workspace/:workspaceId/admin`.
- The web billing panel shows acceptability rollout checks and workspace acceptability admin tools.

Current `v5.129` behavior:

- Production adoptability rollout readiness validates adoptability coverage and readiness through `GET /api/adoptability/readiness`.
- Workspace owners and admins can inspect workspace adoptability metrics from `GET /api/adoptability/workspace/:workspaceId/admin`.
- The web billing panel shows adoptability rollout checks and workspace adoptability admin tools.

Current `v5.128` behavior:

- Production conformance rollout readiness validates conformance coverage and readiness through `GET /api/conformance/readiness`.
- Workspace owners and admins can inspect workspace conformance metrics from `GET /api/conformance/workspace/:workspaceId/admin`.
- The web billing panel shows conformance rollout checks and workspace conformance admin tools.

Current `v5.127` behavior:

- Production feasibility rollout readiness validates feasibility coverage and readiness through `GET /api/feasibility/readiness`.
- Workspace owners and admins can inspect workspace feasibility metrics from `GET /api/feasibility/workspace/:workspaceId/admin`.
- The web billing panel shows feasibility rollout checks and workspace feasibility admin tools.

Current `v5.126` behavior:

- Production viability rollout readiness validates viability coverage and readiness through `GET /api/viability/readiness`.
- Workspace owners and admins can inspect workspace viability metrics from `GET /api/viability/workspace/:workspaceId/admin`.
- The web billing panel shows viability rollout checks and workspace viability admin tools.

Current `v5.125` behavior:

- Production survivability rollout readiness validates survivability coverage and readiness through `GET /api/survivability/readiness`.
- Workspace owners and admins can inspect workspace survivability metrics from `GET /api/survivability/workspace/:workspaceId/admin`.
- The web billing panel shows survivability rollout checks and workspace survivability admin tools.

Current `v5.124` behavior:

- Production appropriateness rollout readiness validates appropriateness coverage and readiness through `GET /api/appropriateness/readiness`.
- Workspace owners and admins can inspect workspace appropriateness metrics from `GET /api/appropriateness/workspace/:workspaceId/admin`.
- The web billing panel shows appropriateness rollout checks and workspace appropriateness admin tools.

Current `v5.123` behavior:

- Production effectiveness rollout readiness validates effectiveness coverage and readiness through `GET /api/effectiveness/readiness`.
- Workspace owners and admins can inspect workspace effectiveness metrics from `GET /api/effectiveness/workspace/:workspaceId/admin`.
- The web billing panel shows effectiveness rollout checks and workspace effectiveness admin tools.

Current `v5.122` behavior:

- Production accessibility rollout readiness validates accessibility coverage and readiness through `GET /api/accessibility/readiness`.
- Workspace owners and admins can inspect workspace accessibility metrics from `GET /api/accessibility/workspace/:workspaceId/admin`.
- The web billing panel shows accessibility rollout checks and workspace accessibility admin tools.

Current `v5.121` behavior:

- Production usability rollout readiness validates usability coverage and readiness through `GET /api/usability/readiness`.
- Workspace owners and admins can inspect workspace usability metrics from `GET /api/usability/workspace/:workspaceId/admin`.
- The web billing panel shows usability rollout checks and workspace usability admin tools.

Current `v5.120` behavior:

- Production trustworthiness rollout readiness validates trustworthiness coverage and readiness through `GET /api/trustworthiness/readiness`.
- Workspace owners and admins can inspect workspace trustworthiness metrics from `GET /api/trustworthiness/workspace/:workspaceId/admin`.
- The web billing panel shows trustworthiness rollout checks and workspace trustworthiness admin tools.

Current `v5.119` behavior:

- Production composability rollout readiness validates composability coverage and readiness through `GET /api/composability/readiness`.
- Workspace owners and admins can inspect workspace composability metrics from `GET /api/composability/workspace/:workspaceId/admin`.
- The web billing panel shows composability rollout checks and workspace composability admin tools.

Current `v5.118` behavior:

- Production dependability rollout readiness validates dependability coverage and readiness through `GET /api/dependability/readiness`.
- Workspace owners and admins can inspect workspace dependability metrics from `GET /api/dependability/workspace/:workspaceId/admin`.
- The web billing panel shows dependability rollout checks and workspace dependability admin tools.

Current `v5.117` behavior:

- Production responsiveness rollout readiness validates responsiveness coverage and readiness through `GET /api/responsiveness/readiness`.
- Workspace owners and admins can inspect workspace responsiveness metrics from `GET /api/responsiveness/workspace/:workspaceId/admin`.
- The web billing panel shows responsiveness rollout checks and workspace responsiveness admin tools.

Current `v5.116` behavior:

- Production repeatability rollout readiness validates repeatability coverage and readiness through `GET /api/repeatability/readiness`.
- Workspace owners and admins can inspect workspace repeatability metrics from `GET /api/repeatability/workspace/:workspaceId/admin`.
- The web billing panel shows repeatability rollout checks and workspace repeatability admin tools.

Current `v5.115` behavior:

- Production predictability rollout readiness validates predictability coverage and readiness through `GET /api/predictability/readiness`.
- Workspace owners and admins can inspect workspace predictability metrics from `GET /api/predictability/workspace/:workspaceId/admin`.
- The web billing panel shows predictability rollout checks and workspace predictability admin tools.

Current `v5.114` behavior:

- Production monitorability rollout readiness validates monitorability coverage and readiness through `GET /api/monitorability/readiness`.
- Workspace owners and admins can inspect workspace monitorability metrics from `GET /api/monitorability/workspace/:workspaceId/admin`.
- The web billing panel shows monitorability rollout checks and workspace monitorability admin tools.

Current `v5.113` behavior:

- Production automatability rollout readiness validates automatability coverage and readiness through `GET /api/automatability/readiness`.
- Workspace owners and admins can inspect workspace automatability metrics from `GET /api/automatability/workspace/:workspaceId/admin`.
- The web billing panel shows automatability rollout checks and workspace automatability admin tools.

Current `v5.112` behavior:

- Production schedulability rollout readiness validates schedulability coverage and readiness through `GET /api/schedulability/readiness`.
- Workspace owners and admins can inspect workspace schedulability metrics from `GET /api/schedulability/workspace/:workspaceId/admin`.
- The web billing panel shows schedulability rollout checks and workspace schedulability admin tools.

Current `v5.111` behavior:

- Production orchestrability rollout readiness validates orchestrability coverage and readiness through `GET /api/orchestrability/readiness`.
- Workspace owners and admins can inspect workspace orchestrability metrics from `GET /api/orchestrability/workspace/:workspaceId/admin`.
- The web billing panel shows orchestrability rollout checks and workspace orchestrability admin tools.

Current `v5.110` behavior:

- Production integrability rollout readiness validates integrability coverage and readiness through `GET /api/integrability/readiness`.
- Workspace owners and admins can inspect workspace integrability metrics from `GET /api/integrability/workspace/:workspaceId/admin`.
- The web billing panel shows integrability rollout checks and workspace integrability admin tools.

Current `v5.109` behavior:

- Production controllability rollout readiness validates controllability coverage and readiness through `GET /api/controllability/readiness`.
- Workspace owners and admins can inspect workspace controllability metrics from `GET /api/controllability/workspace/:workspaceId/admin`.
- The web billing panel shows controllability rollout checks and workspace controllability admin tools.

Current `v5.108` behavior:

- Production manageability rollout readiness validates manageability coverage and readiness through `GET /api/manageability/readiness`.
- Workspace owners and admins can inspect workspace manageability metrics from `GET /api/manageability/workspace/:workspaceId/admin`.
- The web billing panel shows manageability rollout checks and workspace manageability admin tools.

Current `v5.107` behavior:

- Production deployability rollout readiness validates deployability coverage and readiness through `GET /api/deployability/readiness`.
- Workspace owners and admins can inspect workspace deployability metrics from `GET /api/deployability/workspace/:workspaceId/admin`.
- The web billing panel shows deployability rollout checks and workspace deployability admin tools.

Current `v5.106` behavior:

- Production programmability rollout readiness validates programmability coverage and readiness through `GET /api/programmability/readiness`.
- Workspace owners and admins can inspect workspace programmability metrics from `GET /api/programmability/workspace/:workspaceId/admin`.
- The web billing panel shows programmability rollout checks and workspace programmability admin tools.

Current `v5.105` behavior:

- Production adjustability rollout readiness validates adjustability coverage and readiness through `GET /api/adjustability/readiness`.
- Workspace owners and admins can inspect workspace adjustability metrics from `GET /api/adjustability/workspace/:workspaceId/admin`.
- The web billing panel shows adjustability rollout checks and workspace adjustability admin tools.

Current `v5.104` behavior:

- Production tunability rollout readiness validates tunability coverage and readiness through `GET /api/tunability/readiness`.
- Workspace owners and admins can inspect workspace tunability metrics from `GET /api/tunability/workspace/:workspaceId/admin`.
- The web billing panel shows tunability rollout checks and workspace tunability admin tools.

Current `v5.103` behavior:

- Production operability rollout readiness validates operability coverage and readiness through `GET /api/operability/readiness`.
- Workspace owners and admins can inspect workspace operability metrics from `GET /api/operability/workspace/:workspaceId/admin`.
- The web billing panel shows operability rollout checks and workspace operability admin tools.

Current `v5.102` behavior:

- Production customizability rollout readiness validates customizability coverage and readiness through `GET /api/customizability/readiness`.
- Workspace owners and admins can inspect workspace customizability metrics from `GET /api/customizability/workspace/:workspaceId/admin`.
- The web billing panel shows customizability rollout checks and workspace customizability admin tools.

Current `v5.101` behavior:

- Production configurability rollout readiness validates configurability coverage and readiness through `GET /api/configurability/readiness`.
- Workspace owners and admins can inspect workspace configurability metrics from `GET /api/configurability/workspace/:workspaceId/admin`.
- The web billing panel shows configurability rollout checks and workspace configurability admin tools.

Current `v5.100` behavior:

- Production modifiability rollout readiness validates modifiability coverage and readiness through `GET /api/modifiability/readiness`.
- Workspace owners and admins can inspect workspace modifiability metrics from `GET /api/modifiability/workspace/:workspaceId/admin`.
- The web billing panel shows modifiability rollout checks and workspace modifiability admin tools.

Current `v5.99` behavior:

- Production extensibility rollout readiness validates extensibility coverage and readiness through `GET /api/extensibility/readiness`.
- Workspace owners and admins can inspect workspace extensibility metrics from `GET /api/extensibility/workspace/:workspaceId/admin`.
- The web billing panel shows extensibility rollout checks and workspace extensibility admin tools.

Current `v5.98` behavior:

- Production flexibility rollout readiness validates flexibility coverage and readiness through `GET /api/flexibility/readiness`.
- Workspace owners and admins can inspect workspace flexibility metrics from `GET /api/flexibility/workspace/:workspaceId/admin`.
- The web billing panel shows flexibility rollout checks and workspace flexibility admin tools.

Current `v5.97` behavior:

- Production adaptability rollout readiness validates adaptability coverage and readiness through `GET /api/adaptability/readiness`.
- Workspace owners and admins can inspect workspace adaptability metrics from `GET /api/adaptability/workspace/:workspaceId/admin`.
- The web billing panel shows adaptability rollout checks and workspace adaptability admin tools.

Current `v5.96` behavior:

- Production compatibility rollout readiness validates compatibility coverage and readiness through `GET /api/compatibility/readiness`.
- Workspace owners and admins can inspect workspace compatibility metrics from `GET /api/compatibility/workspace/:workspaceId/admin`.
- The web billing panel shows compatibility rollout checks and workspace compatibility admin tools.

Current `v5.95` behavior:

- Production portability rollout readiness validates portability coverage and readiness through `GET /api/portability/readiness`.
- Workspace owners and admins can inspect workspace portability metrics from `GET /api/portability/workspace/:workspaceId/admin`.
- The web billing panel shows portability rollout checks and workspace portability admin tools.

Current `v5.94` behavior:

- Production transferability rollout readiness validates transferability coverage and readiness through `GET /api/transferability/readiness`.
- Workspace owners and admins can inspect workspace transferability metrics from `GET /api/transferability/workspace/:workspaceId/admin`.
- The web billing panel shows transferability rollout checks and workspace transferability admin tools.

Current `v5.93` behavior:

- Production interchangeability rollout readiness validates interchangeability coverage and readiness through `GET /api/interchangeability/readiness`.
- Workspace owners and admins can inspect workspace interchangeability metrics from `GET /api/interchangeability/workspace/:workspaceId/admin`.
- The web billing panel shows interchangeability rollout checks and workspace interchangeability admin tools.

Current `v5.92` behavior:

- Production linkability rollout readiness validates linkability coverage and readiness through `GET /api/linkability/readiness`.
- Workspace owners and admins can inspect workspace linkability metrics from `GET /api/linkability/workspace/:workspaceId/admin`.
- The web billing panel shows linkability rollout checks and workspace linkability admin tools.

Current `v5.91` behavior:

- Production connectability rollout readiness validates connectability coverage and readiness through `GET /api/connectability/readiness`.
- Workspace owners and admins can inspect workspace connectability metrics from `GET /api/connectability/workspace/:workspaceId/admin`.
- The web billing panel shows connectability rollout checks and workspace connectability admin tools.

Current `v5.90` behavior:

- Production navigability rollout readiness validates navigability coverage and readiness through `GET /api/navigability/readiness`.
- Workspace owners and admins can inspect workspace navigability metrics from `GET /api/navigability/workspace/:workspaceId/admin`.
- The web billing panel shows navigability rollout checks and workspace navigability admin tools.

Current `v5.89` behavior:

- Production discoverability rollout readiness validates discoverability coverage and readiness through `GET /api/discoverability/readiness`.
- Workspace owners and admins can inspect workspace discoverability metrics from `GET /api/discoverability/workspace/:workspaceId/admin`.
- The web billing panel shows discoverability rollout checks and workspace discoverability admin tools.

Current `v5.88` behavior:

- Production retrievability rollout readiness validates retrievability coverage and readiness through `GET /api/retrievability/readiness`.
- Workspace owners and admins can inspect workspace retrievability metrics from `GET /api/retrievability/workspace/:workspaceId/admin`.
- The web billing panel shows retrievability rollout checks and workspace retrievability admin tools.

Current `v5.87` behavior:

- Production locatability rollout readiness validates locatability coverage and readiness through `GET /api/locatability/readiness`.
- Workspace owners and admins can inspect workspace locatability metrics from `GET /api/locatability/workspace/:workspaceId/admin`.
- The web billing panel shows locatability rollout checks and workspace locatability admin tools.

Current `v5.86` behavior:

- Production referencability rollout readiness validates referencability coverage and readiness through `GET /api/referencability/readiness`.
- Workspace owners and admins can inspect workspace referencability metrics from `GET /api/referencability/workspace/:workspaceId/admin`.
- The web billing panel shows referencability rollout checks and workspace referencability admin tools.

Current `v5.85` behavior:

- Production assignability rollout readiness validates assignability coverage and readiness through `GET /api/assignability/readiness`.
- Workspace owners and admins can inspect workspace assignability metrics from `GET /api/assignability/workspace/:workspaceId/admin`.
- The web billing panel shows assignability rollout checks and workspace assignability admin tools.

Current `v5.84` behavior:

- Production distinguishability rollout readiness validates distinguishability coverage and readiness through `GET /api/distinguishability/readiness`.
- Workspace owners and admins can inspect workspace distinguishability metrics from `GET /api/distinguishability/workspace/:workspaceId/admin`.
- The web billing panel shows distinguishability rollout checks and workspace distinguishability admin tools.

Current `v5.83` behavior:

- Production comparability rollout readiness validates comparability coverage and readiness through `GET /api/comparability/readiness`.
- Workspace owners and admins can inspect workspace comparability metrics from `GET /api/comparability/workspace/:workspaceId/admin`.
- The web billing panel shows comparability rollout checks and workspace comparability admin tools.

Current `v5.82` behavior:

- Production identifiability rollout readiness validates identifiability coverage and readiness through `GET /api/identifiability/readiness`.
- Workspace owners and admins can inspect workspace identifiability metrics from `GET /api/identifiability/workspace/:workspaceId/admin`.
- The web billing panel shows identifiability rollout checks and workspace identifiability admin tools.

Current `v5.81` behavior:

- Production attributability rollout readiness validates attributability coverage and readiness through `GET /api/attributability/readiness`.
- Workspace owners and admins can inspect workspace attributability metrics from `GET /api/attributability/workspace/:workspaceId/admin`.
- The web billing panel shows attributability rollout checks and workspace attributability admin tools.

Current `v5.80` behavior:

- Production warrantability rollout readiness validates warrantability coverage and readiness through `GET /api/warrantability/readiness`.
- Workspace owners and admins can inspect workspace warrantability metrics from `GET /api/warrantability/workspace/:workspaceId/admin`.
- The web billing panel shows warrantability rollout checks and workspace warrantability admin tools.

Current `v5.79` behavior:

- Production substantiability rollout readiness validates substantiability coverage and readiness through `GET /api/substantiability/readiness`.
- Workspace owners and admins can inspect workspace substantiability metrics from `GET /api/substantiability/workspace/:workspaceId/admin`.
- The web billing panel shows substantiability rollout checks and workspace substantiability admin tools.

Current `v5.78` behavior:

- Production certifiability rollout readiness validates certifiability coverage and readiness through `GET /api/certifiability/readiness`.
- Workspace owners and admins can inspect workspace certifiability metrics from `GET /api/certifiability/workspace/:workspaceId/admin`.
- The web billing panel shows certifiability rollout checks and workspace certifiability admin tools.

Current `v5.77` behavior:

- Production measurability rollout readiness validates measurability coverage and readiness through `GET /api/measurability/readiness`.
- Workspace owners and admins can inspect workspace measurability metrics from `GET /api/measurability/workspace/:workspaceId/admin`.
- The web billing panel shows measurability rollout checks and workspace measurability admin tools.

Current `v5.76` behavior:

- Production assessability rollout readiness validates assessability coverage and readiness through `GET /api/assessability/readiness`.
- Workspace owners and admins can inspect workspace assessability metrics from `GET /api/assessability/workspace/:workspaceId/admin`.
- The web billing panel shows assessability rollout checks and workspace assessability admin tools.

Current `v5.75` behavior:

- Production reviewability rollout readiness validates reviewability coverage and readiness through `GET /api/reviewability/readiness`.
- Workspace owners and admins can inspect workspace reviewability metrics from `GET /api/reviewability/workspace/:workspaceId/admin`.
- The web billing panel shows reviewability rollout checks and workspace reviewability admin tools.

Current `v5.74` behavior:

- Production justifiability rollout readiness validates justifiability coverage and readiness through `GET /api/justifiability/readiness`.
- Workspace owners and admins can inspect workspace justifiability metrics from `GET /api/justifiability/workspace/:workspaceId/admin`.
- The web billing panel shows justifiability rollout checks and workspace justifiability admin tools.

Current `v5.73` behavior:

- Production demonstrability rollout readiness validates demonstrability coverage and readiness through `GET /api/demonstrability/readiness`.
- Workspace owners and admins can inspect workspace demonstrability metrics from `GET /api/demonstrability/workspace/:workspaceId/admin`.
- The web billing panel shows demonstrability rollout checks and workspace demonstrability admin tools.

Current `v5.72` behavior:

- Production explainability rollout readiness validates explainability coverage and readiness through `GET /api/explainability/readiness`.
- Workspace owners and admins can inspect workspace explainability metrics from `GET /api/explainability/workspace/:workspaceId/admin`.
- The web billing panel shows explainability rollout checks and workspace explainability admin tools.

Current `v5.71` behavior:

- Production inspectability rollout readiness validates inspectability coverage and readiness through `GET /api/inspectability/readiness`.
- Workspace owners and admins can inspect workspace inspectability metrics from `GET /api/inspectability/workspace/:workspaceId/admin`.
- The web billing panel shows inspectability rollout checks and workspace inspectability admin tools.

Current `v5.70` behavior:

- Production auditability rollout readiness validates auditability coverage and readiness through `GET /api/auditability/readiness`.
- Workspace owners and admins can inspect workspace auditability metrics from `GET /api/auditability/workspace/:workspaceId/admin`.
- The web billing panel shows auditability rollout checks and workspace auditability admin tools.

Current `v5.69` behavior:

- Production defensibility rollout readiness validates defensibility coverage and readiness through `GET /api/defensibility/readiness`.
- Workspace owners and admins can inspect workspace defensibility metrics from `GET /api/defensibility/workspace/:workspaceId/admin`.
- The web billing panel shows defensibility rollout checks and workspace defensibility admin tools.

Current `v5.68` behavior:

- Production reproducibility rollout readiness validates reproducibility coverage and readiness through `GET /api/reproducibility/readiness`.
- Workspace owners and admins can inspect workspace reproducibility metrics from `GET /api/reproducibility/workspace/:workspaceId/admin`.
- The web billing panel shows reproducibility rollout checks and workspace reproducibility admin tools.

Current `v5.67` behavior:

- Production credibility rollout readiness validates credibility coverage and readiness through `GET /api/credibility/readiness`.
- Workspace owners and admins can inspect workspace credibility metrics from `GET /api/credibility/workspace/:workspaceId/admin`.
- The web billing panel shows credibility rollout checks and workspace credibility admin tools.

Current `v5.66` behavior:

- Production validity rollout readiness validates validity coverage and readiness through `GET /api/validity/readiness`.
- Workspace owners and admins can inspect workspace validity metrics from `GET /api/validity/workspace/:workspaceId/admin`.
- The web billing panel shows validity rollout checks and workspace validity admin tools.

Current `v5.65` behavior:

- Production confirmability rollout readiness validates confirmability coverage and readiness through `GET /api/confirmability/readiness`.
- Workspace owners and admins can inspect workspace confirmability metrics from `GET /api/confirmability/workspace/:workspaceId/admin`.
- The web billing panel shows confirmability rollout checks and workspace confirmability admin tools.

Current `v5.64` behavior:

- Production verifiability rollout readiness validates verifiability coverage and readiness through `GET /api/verifiability/readiness`.
- Workspace owners and admins can inspect workspace verifiability metrics from `GET /api/verifiability/workspace/:workspaceId/admin`.
- The web billing panel shows verifiability rollout checks and workspace verifiability admin tools.

Current `v5.63` behavior:

- Production provenance rollout readiness validates provenance coverage and readiness through `GET /api/provenance/readiness`.
- Workspace owners and admins can inspect workspace provenance metrics from `GET /api/provenance/workspace/:workspaceId/admin`.
- The web billing panel shows provenance rollout checks and workspace provenance admin tools.

Current `v5.62` behavior:

- Production authenticity rollout readiness validates authenticity coverage and readiness through `GET /api/authenticity/readiness`.
- Workspace owners and admins can inspect workspace authenticity metrics from `GET /api/authenticity/workspace/:workspaceId/admin`.
- The web billing panel shows authenticity rollout checks and workspace authenticity admin tools.

Current `v5.61` behavior:

- Production attestation rollout readiness validates attestation coverage and readiness through `GET /api/attestation/readiness`.
- Workspace owners and admins can inspect workspace attestation metrics from `GET /api/attestation/workspace/:workspaceId/admin`.
- The web billing panel shows attestation rollout checks and workspace attestation admin tools.

Current `v5.60` behavior:

- Production transparency rollout readiness validates transparency coverage and disclosure readiness through `GET /api/transparency/readiness`.
- Workspace owners and admins can inspect workspace transparency metrics from `GET /api/transparency/workspace/:workspaceId/admin`.
- The web billing panel shows transparency rollout checks and workspace transparency admin tools.

Current `v5.59` behavior:

- Production accountability rollout readiness validates accountability coverage and audit readiness through `GET /api/accountability/readiness`.
- Workspace owners and admins can inspect workspace accountability metrics from `GET /api/accountability/workspace/:workspaceId/admin`.
- The web billing panel shows accountability rollout checks and workspace accountability admin tools.

Current `v5.58` behavior:

- Production assurance rollout readiness validates assurance coverage and quality readiness through `GET /api/assurance/readiness`.
- Workspace owners and admins can inspect workspace assurance metrics from `GET /api/assurance/workspace/:workspaceId/admin`.
- The web billing panel shows assurance rollout checks and workspace assurance admin tools.

Current `v5.57` behavior:

- Production oversight rollout readiness validates oversight coverage and control readiness through `GET /api/oversight/readiness`.
- Workspace owners and admins can inspect workspace oversight metrics from `GET /api/oversight/workspace/:workspaceId/admin`.
- The web billing panel shows oversight rollout checks and workspace oversight admin tools.

Current `v5.56` behavior:

- Production governance rollout readiness validates governance coverage and policy readiness through `GET /api/governance/readiness`.
- Workspace owners and admins can inspect workspace governance metrics from `GET /api/governance/workspace/:workspaceId/admin`.
- The web billing panel shows governance rollout checks and workspace governance admin tools.

Current `v5.55` behavior:

- Production sustainability rollout readiness validates sustainability coverage and operational readiness through `GET /api/sustainability/readiness`.
- Workspace owners and admins can inspect workspace sustainability metrics from `GET /api/sustainability/workspace/:workspaceId/admin`.
- The web billing panel shows sustainability rollout checks and workspace sustainability admin tools.

Current `v5.54` behavior:

- Production utilization rollout readiness validates utilization coverage and capacity readiness through `GET /api/utilization/readiness`.
- Workspace owners and admins can inspect workspace utilization metrics from `GET /api/utilization/workspace/:workspaceId/admin`.
- The web billing panel shows utilization rollout checks and workspace utilization admin tools.

Current `v5.53` behavior:

- Production optimization rollout readiness validates optimization coverage and performance readiness through `GET /api/optimization/readiness`.
- Workspace owners and admins can inspect workspace optimization metrics from `GET /api/optimization/workspace/:workspaceId/admin`.
- The web billing panel shows optimization rollout checks and workspace optimization admin tools.

Current `v5.52` behavior:

- Production efficiency rollout readiness validates efficiency coverage and resource readiness through `GET /api/efficiency/readiness`.
- Workspace owners and admins can inspect workspace efficiency metrics from `GET /api/efficiency/workspace/:workspaceId/admin`.
- The web billing panel shows efficiency rollout checks and workspace efficiency admin tools.

Current `v5.51` behavior:

- Production traceability rollout readiness validates traceability coverage and lineage readiness through `GET /api/traceability/readiness`.
- Workspace owners and admins can inspect workspace traceability metrics from `GET /api/traceability/workspace/:workspaceId/admin`.
- The web billing panel shows traceability rollout checks and workspace traceability admin tools.

Current `v5.50` behavior:

- Production scalability rollout readiness validates scalability coverage and growth readiness through `GET /api/scalability/readiness`.
- Workspace owners and admins can inspect workspace scalability metrics from `GET /api/scalability/workspace/:workspaceId/admin`.
- The web billing panel shows scalability rollout checks and workspace scalability admin tools.

Current `v5.49` behavior:

- Production maintainability rollout readiness validates maintainability coverage and operability readiness through `GET /api/maintainability/readiness`.
- Workspace owners and admins can inspect workspace maintainability metrics from `GET /api/maintainability/workspace/:workspaceId/admin`.
- The web billing panel shows maintainability rollout checks and workspace maintainability admin tools.

Current `v5.48` behavior:

- Production recoverability rollout readiness validates recoverability coverage and recovery readiness through `GET /api/recoverability/readiness`.
- Workspace owners and admins can inspect workspace recoverability metrics from `GET /api/recoverability/workspace/:workspaceId/admin`.
- The web billing panel shows recoverability rollout checks and workspace recoverability admin tools.

Current `v5.47` behavior:

- Production durability rollout readiness validates durability coverage and persistence readiness through `GET /api/durability/readiness`.
- Workspace owners and admins can inspect workspace durability metrics from `GET /api/durability/workspace/:workspaceId/admin`.
- The web billing panel shows durability rollout checks and workspace durability admin tools.

Current `v5.46` behavior:

- Production integrity rollout readiness validates integrity coverage and verification readiness through `GET /api/integrity/readiness`.
- Workspace owners and admins can inspect workspace integrity metrics from `GET /api/integrity/workspace/:workspaceId/admin`.
- The web billing panel shows integrity rollout checks and workspace integrity admin tools.

Current `v5.45` behavior:

- Production consistency rollout readiness validates consistency coverage and alignment readiness through `GET /api/consistency/readiness`.
- Workspace owners and admins can inspect workspace consistency metrics from `GET /api/consistency/workspace/:workspaceId/admin`.
- The web billing panel shows consistency rollout checks and workspace consistency admin tools.

Current `v5.44` behavior:

- Production stability rollout readiness validates stability coverage and drift readiness through `GET /api/stability/readiness`.
- Workspace owners and admins can inspect workspace stability metrics from `GET /api/stability/workspace/:workspaceId/admin`.
- The web billing panel shows stability rollout checks and workspace stability admin tools.

Current `v5.43` behavior:

- Production reliability rollout readiness validates reliability coverage and fault tolerance readiness through `GET /api/reliability/readiness`.
- Workspace owners and admins can inspect workspace reliability metrics from `GET /api/reliability/workspace/:workspaceId/admin`.
- The web billing panel shows reliability rollout checks and workspace reliability admin tools.

Current `v5.42` behavior:

- Production availability rollout readiness validates availability coverage and uptime readiness through `GET /api/availability/readiness`.
- Workspace owners and admins can inspect workspace availability metrics from `GET /api/availability/workspace/:workspaceId/admin`.
- The web billing panel shows availability rollout checks and workspace availability admin tools.

Current `v5.41` behavior:

- Production resilience rollout readiness validates resilience coverage and recovery readiness through `GET /api/resilience/readiness`.
- Workspace owners and admins can inspect workspace resilience metrics from `GET /api/resilience/workspace/:workspaceId/admin`.
- The web billing panel shows resilience rollout checks and workspace resilience admin tools.

Current `v5.40` behavior:

- Production performance rollout readiness validates performance coverage and latency readiness through `GET /api/performance/readiness`.
- Workspace owners and admins can inspect workspace performance metrics from `GET /api/performance/workspace/:workspaceId/admin`.
- The web billing panel shows performance rollout checks and workspace performance admin tools.

Current `v5.39` behavior:

- Production capacity rollout readiness validates capacity coverage and scaling readiness through `GET /api/capacity/readiness`.
- Workspace owners and admins can inspect workspace capacity metrics from `GET /api/capacity/workspace/:workspaceId/admin`.
- The web billing panel shows capacity rollout checks and workspace capacity admin tools.

Current `v5.38` behavior:

- Production SLO rollout readiness validates SLO coverage and target readiness through `GET /api/slo/readiness`.
- Workspace owners and admins can inspect workspace SLO metrics from `GET /api/slo/workspace/:workspaceId/admin`.
- The web billing panel shows SLO rollout checks and workspace SLO admin tools.

Current `v5.37` behavior:

- Production release rollout readiness validates release coverage and rollout readiness through `GET /api/releases/readiness`.
- Workspace owners and admins can inspect workspace release metrics from `GET /api/releases/workspace/:workspaceId/admin`.
- The web billing panel shows release rollout checks and workspace release admin tools.

Current `v5.36` behavior:

- Production incident response rollout readiness validates incident coverage and escalation readiness through `GET /api/incidents/readiness`.
- Workspace owners and admins can inspect workspace incident metrics from `GET /api/incidents/workspace/:workspaceId/admin`.
- The web billing panel shows incident response rollout checks and workspace incident admin tools.

Current `v5.35` behavior:

- Production compliance rollout readiness validates policy coverage and attestation readiness through `GET /api/compliance/readiness`.
- Workspace owners and admins can inspect workspace compliance metrics from `GET /api/compliance/workspace/:workspaceId/admin`.
- The web billing panel shows compliance rollout checks and workspace compliance admin tools.

Current `v5.34` behavior:

- Production audit trail rollout readiness validates audit coverage and retention readiness through `GET /api/audit/readiness`.
- Workspace owners and admins can inspect workspace audit metrics from `GET /api/audit/workspace/:workspaceId/admin`.
- The web billing panel shows audit trail rollout checks and workspace audit admin tools.

Current `v5.33` behavior:

- Production backup rollout readiness validates backup coverage and restore readiness through `GET /api/backup/readiness`.
- Workspace owners and admins can inspect recoverable workspace data from `GET /api/backup/workspace/:workspaceId/admin`.
- The web billing panel shows backup rollout checks and workspace backup admin tools.

Current `v5.32` behavior:

- Database migration rollout readiness validates schema migration coverage through `GET /api/migrations/readiness`.
- Workspace owners and admins can inspect applied and pending migrations from `GET /api/migrations/workspace/:workspaceId/admin`.
- The web billing panel shows migration rollout checks and workspace migration admin tools.

Current `v5.31` behavior:

- Deployment health rollout readiness validates API readiness and dependency health through `GET /api/deployment/readiness`.
- Workspace owners and admins can inspect deployment health from `GET /api/deployment/workspace/:workspaceId/admin`.
- The web billing panel shows deployment health rollout checks and workspace deployment admin tools.

Current `v5.30` behavior:

- Usage limits rollout readiness validates quota enforcement through `GET /api/usage/limits/readiness`.
- Workspace owners and admins can inspect quota utilization from `GET /api/usage/limits/workspace/:workspaceId/admin`.
- The web billing panel shows usage limits rollout checks and workspace quota admin tools.

Current `v5.29` behavior:

- Idempotency rollout readiness validates Redis reservations and persisted keys through `GET /api/idempotency/readiness`.
- Workspace owners and admins can inspect and clear idempotency reservations from `GET /api/idempotency/workspace/:workspaceId/admin`.
- The web billing panel shows idempotency rollout checks and workspace idempotency admin tools.

Current `v5.28` behavior:

- Stream replay rollout readiness validates Redis-backed SSE buffers and Last-Event-ID replay through `GET /api/runs/stream/readiness`.
- Workspace owners and admins can inspect and clear buffered SSE runs from `GET /api/runs/stream/workspace/:workspaceId/admin`.
- The web billing panel shows stream replay rollout checks and workspace stream recovery admin tools.

Current `v5.27` behavior:

- Run history rollout readiness validates artifact persistence and export readiness through `GET /api/runs/history/readiness`.
- Workspace owners and admins can inspect and export run history metrics from `GET /api/runs/history/workspace/:workspaceId/admin`.
- The web billing panel shows run history rollout checks and workspace run history admin tools.

Current `v5.26` behavior:

- Prompt evaluation rollout readiness validates regression dataset coverage through `GET /api/evaluation/readiness`.
- Workspace owners and admins can inspect and rerun prompt regression metrics from `GET /api/evaluation/workspace/:workspaceId/admin`.
- The web billing panel shows prompt evaluation rollout checks and workspace prompt regression admin tools.

Current `v5.25` behavior:

- Observability rollout readiness validates structured logging and pipeline event coverage through `GET /api/observability/readiness`.
- Workspace owners and admins can inspect recent pipeline observability events from `GET /api/observability/workspace/:workspaceId/admin`.
- The web billing panel shows observability rollout checks and workspace observability admin tools.

Current `v5.24` behavior:

- Provider credentials rollout readiness validates encryption and persistence through `GET /api/provider-credentials/readiness`.
- Production rejects the default development encryption key.
- Workspace owners and admins can inspect and test workspace provider keys from `GET /api/provider-credentials/workspace/:workspaceId/admin`.
- The web billing panel shows provider credentials rollout checks and workspace provider key admin tools.

Current `v5.23` behavior:

- Shield rollout readiness validates classifier review regression through `GET /api/shield/readiness`.
- Workspace owners and admins can inspect and rerun Shield review metrics from `GET /api/shield/workspace/:workspaceId/admin`.
- Legacy Shield review summary endpoint is gated behind workspace owner/admin access.
- The web billing panel shows Shield rollout checks and workspace Shield review admin tools.

Current `v5.22` behavior:

- Model router rollout readiness validates production registry alignment through `GET /api/model-router/readiness`.
- Workspace owners and admins can inspect and recover degraded models from `GET /api/model-router/workspace/:workspaceId/admin`.
- Legacy model recover endpoint is gated behind workspace owner/admin access.
- The web billing panel shows model router rollout checks and workspace model health admin tools.

Current `v5.21` behavior:

- Temporal rollout readiness validates production Temporal configuration through `GET /api/runs/temporal/readiness`.
- Production rejects local Temporal addresses when durable workflows are enabled.
- Workspace owners and admins can manage workspace settings from `GET /api/workspaces/:workspaceId/admin/settings`.
- The web billing panel shows Temporal rollout checks and workspace settings admin tools.

Current `v5.20` behavior:

- Research rollout readiness validates production research configuration through `GET /api/research/readiness`.
- Production rejects mock research providers at startup.
- Workspace owners and admins can export audit records from `GET /api/workspaces/:workspaceId/admin/audit/export`.
- The web billing panel shows research rollout checks and workspace audit export actions.

Current `v5.19` behavior:

- LLM rollout readiness validates production provider configuration through `GET /api/llm/readiness`.
- Production rejects mock primary LLM providers at startup.
- Workspace owners and admins can manage member roles from `GET /api/workspaces/:workspaceId/admin/members`.
- The web billing panel shows LLM rollout checks and workspace member admin tools.

Current `v5.18` behavior:

- Auth rollout readiness validates production auth configuration through `GET /api/auth/readiness`.
- Production rejects header auth, external mock adapter, and missing bearer bootstrap tokens.
- Workspace owners and admins can inspect usage metrics from `GET /api/usage/workspace/:workspaceId/admin` and reset daily usage locally.
- The web billing panel shows auth rollout checks and usage admin tools.

Current `v5.17` behavior:

- Workspace owners and admins can inspect billing health metrics from `GET /api/billing/workspace/:workspaceId/admin`.
- Billing admin actions sync notifications and reset mock billing state for local testing.
- The web billing panel shows billing admin stats and role-gated action buttons.

Current `v5.16` behavior:

- Billing rollout readiness validates production Stripe configuration through `GET /api/billing/readiness`.
- Production rejects mock billing adapter when Stripe billing is enabled.
- The web billing panel shows rollout checklist status and operator guidance.

Current `v5.15` behavior:

- Billing alert notifications are persisted and delivered once per alert id.
- Mock notification delivery is enabled when billing is active; email adapter requires `BILLING_NOTIFICATION_RECIPIENT`.
- The web billing panel shows notification delivery history with channel and status.

Current `v5.14` behavior:

- Paid workspaces report pipeline token usage to mock or Stripe metered billing after runs complete.
- Billing records store Stripe subscription item ids for metered usage reporting.
- The web billing panel shows recent metered usage report history.

Current `v5.13` behavior:

- Billing alerts surface daily usage threshold warnings and subscription status issues.
- Workspace owners can inspect alerts from the billing API and web billing panel.
- Billing alerts are available when billing is enabled (`supportsBillingAlerts: true`).

Current `v5.12` behavior:

- Workspace invoice history can be exported as CSV or JSON attachments from the billing API.
- The web billing panel provides one-click export actions for accounting workflows.
- Billing export is available when billing is enabled (`supportsBillingExport: true`).

Current `v5.11` behavior:

- Billing usage summary exposes daily token and cost consumption against tier limits.
- Workspace owners can inspect usage from the billing API and web billing panel meters.
- Usage summary is available when billing is enabled (`supportsUsageSummary: true`).

Current `v5.10` behavior:

- Billing invoices are persisted in `billing_invoices` and exposed through workspace invoice history endpoints.
- Checkout and webhook flows upsert paid or failed invoice records for mock and Stripe billing.
- The web billing panel shows recent invoice history with amount, status, and hosted invoice links when available.

Current `v5.9` behavior:

- Billing webhooks are processed idempotently and persisted in `billing_webhook_events`.
- Duplicate webhook deliveries are ignored safely after the first successful processing.
- Workspace billing panels can show recent webhook audit events.
- Stripe `invoice.payment_failed` events mark the matching workspace billing record as `past_due`.

Current `v5.8` behavior:

- `POST /api/billing/customer-portal-session` opens Stripe Billing Portal or a mock portal for local development.
- Mock portal supports subscription cancellation through `POST /api/billing/mock/portal/cancel`.
- The web billing panel exposes **Manage subscription** after checkout creates a billing customer.
- Stripe portal returns to `STRIPE_PORTAL_RETURN_URL` (default `/billing/portal`).

Current `v5.7` behavior:

- The web app shows a Workspace Billing panel with current tier, status, and upgrade actions.
- Mock checkout completes inline without leaving the app; Stripe checkout redirects to hosted checkout and returns via `/billing/success`.
- Billing status refresh runs automatically after checkout return hints.

Current `v5.6` behavior:

- `STRIPE_ENABLED=true` activates billing checkout flows with mock or Stripe adapters.
- `GET /api/billing/capabilities` reports whether checkout is enabled and which adapter is active.
- `POST /api/billing/checkout-session` starts pro or business checkout for the current workspace.
- Mock adapter completes checkout through `GET /api/billing/mock/complete?sessionId=...`.
- Stripe webhooks at `POST /api/billing/webhook` activate or downgrade workspace tiers in PostgreSQL.
- Subscription activation updates both `billing_records` and `workspace_usage_limits`.

Current `v5.5` behavior:

- External auth users can be auto-provisioned into PostgreSQL users, workspaces, memberships, and default billing records.
- `POST /api/auth/provision` explicitly bootstraps external users and returns provisioning actions.
- `AUTH_EXTERNAL_AUTO_PROVISION=true` enables guard-time provisioning for verified external tokens.

Current `v5.4` behavior:

- `AUTH_PROVIDER=external` verifies Clerk or Auth0 JWTs through mock HS256 or JWKS adapters.
- External tokens map provider subjects to internal user ids such as `clerk_<sub>`.
- Workspace context can come from vendor claims (`org_id` for Clerk) or `x-workspace-id`.
- The frontend sends `VITE_AUTH_EXTERNAL_TOKEN` when external auth is active.

Current `v5.3` behavior:

- `POST /api/auth/session` issues HMAC-signed workspace session tokens with configurable TTL.
- `AUTH_PROVIDER=session` accepts signed session tokens instead of workspace headers on protected routes.
- The frontend bootstraps and persists signed sessions in local storage when session auth is active.

Current `v5.2` behavior:

- `GET /api/auth/capabilities` reports whether the API expects header-only or bearer auth.
- `AUTH_PROVIDER=bearer` gates protected routes with a shared bearer token before workspace checks run.
- The frontend loads auth capabilities on startup and sends `Authorization` when `VITE_AUTH_BEARER_TOKEN` is configured.

Current `v5.1` behavior:

- Production web image serves the Vite build through nginx on port `8080`.
- nginx proxies `/api` to the API container with SSE-friendly settings (`proxy_buffering off`).
- Docker builds the web app with `VITE_API_URL=/api` for same-origin API calls behind nginx.
- `npm run docker:up:full` starts postgres, redis, api, and web together.

Current `v5.0` behavior:

- `GET /api/health/ready` verifies PostgreSQL and Redis before reporting the API as ready.
- Multi-stage Docker images build the API and optional Temporal worker from the monorepo.
- Docker Compose can start PostgreSQL, Redis, and the production API container with migration-on-startup.
- Root scripts `docker:build`, `docker:up:stack`, and `docker:up:temporal` wrap the deployment stack.

Current `v4.8` behavior:

- `GET /api/runs/workflows/:workflowId/stream` stays open and polls the shared run stream buffer until a terminal event or stream timeout.
- Incremental stream polls do not re-emit fallback `workflow_status` events when no new buffered events exist.
- The frontend keeps one long-lived Temporal stream open in parallel with workflow status polling.

Current `v4.7` behavior:

- Temporal workers publish heartbeat records to Redis every 30 seconds.
- `GET /api/runs/temporal/health` reports server reachability, worker heartbeat freshness, and actionable runtime guidance.
- The frontend shows Temporal runtime health guidance when auto-selected Temporal execution is active.

Current `v4.6` behavior:

- Temporal worker activities execute approved runs through `executeMockPipelineStream` and append pipeline events to the shared run stream buffer.
- `GET /api/runs/workflows/:workflowId/stream` replays buffered pipeline events for Temporal-owned runs, not only `workflow_status` updates.
- Temporal frontend observation uses incremental `Last-Event-ID` replay during status polling.

Current `v4.5` behavior:

- `GET /api/runs/capabilities` exposes runtime metadata including `defaultPath`, `temporalEnabled`, and `taskQueue`.
- When `VITE_USE_TEMPORAL_WORKFLOWS=auto` (default), the frontend selects Temporal execution if the API reports `TEMPORAL_ENABLED=true`.
- `VITE_USE_TEMPORAL_WORKFLOWS=true` or `false` still force Temporal or direct REST/SSE execution.
- The Execute panel shows which approved-run runtime path is active.

Current `v4.4` behavior:

- Temporal workflow observation can be resumed after page refresh, stream interruption, or observation timeout.
- The frontend persists active Temporal workflow metadata in local storage and replays stream events with `Last-Event-ID`.
- `POST /api/runs/workflows/:workflowId/recover` syncs persisted workflow metadata from Temporal when available and returns a recovery hint.
- `GET /api/runs/workflows/by-run/:runId` looks up the latest persisted Temporal workflow for a run.
- Failed terminal Temporal statuses surface actionable error messages instead of raw status codes.
- `GET /api/runs/workflows/:workflowId/status` preserves `404`/`403` errors instead of wrapping them as `503`.

Current `v4.3` behavior:

- Default provider is `mock`, so local development does not require API keys.
- All JSON responses are parsed and validated with Zod schemas.
- Invalid responses are retried with a repair instruction.
- Repeated validation failures return a safe fallback object.
- Token usage is estimated and returned with gateway results.
- Triage and base agent outputs are produced through versioned prompts.
- Agent outputs store prompt version, provider, model, validation status, and token metadata.
- Moderator synthesis is produced through a versioned prompt.
- Executive Summary, PRD, and Development Prompt are generated sequentially through versioned prompts.
- The Development Prompt receives the completed PRD as direct input.
- Generated artifact metadata stores prompt version, provider, model, validation status, token usage, cost, and Shield status.
- Human Review shows Shield warning cards, highlighted risky spans, click-to-explain findings, agent rationale, and cost/duration preview.
- The artifact viewer uses tabs with prompt/version/model metadata so generated outputs are easier to inspect.
- `POST /api/runs/mock-pipeline/stream` streams status events, final artifact events, and a completed event using `text/event-stream`.
- The frontend consumes the stream through `fetch`, shows live status updates, and stores the latest completed result locally for refresh recovery.
- Run creation and execution routes are protected by workspace membership checks.
- Local development uses seeded `user_local` and `local_workspace` records.
- Completed pipeline runs write auditable usage events for agent, Moderator, and artifact LLM phases.
- Workspace daily cost limits are checked before expensive execution starts.
- Billing records exist as Stripe-ready local records; v5.6 adds checkout activation and webhook tier updates.
- `GET /api/runs/artifacts/history` returns workspace-scoped persisted artifacts from previous runs.
- `GET /api/runs/artifacts/:artifactId/export/markdown` exports the immutable persisted artifact content as Markdown.
- The frontend includes an Artifact History panel with Markdown export controls.
- Streamed run events are buffered in Redis Streams with an in-memory test fallback.
- `Last-Event-ID` replay returns missed stream events without rerunning a completed pipeline.
- The frontend preserves the last stream event ID after a stream error and retries the same run with `Last-Event-ID`.
- Pipeline phases, quota checks, Shield scans, LLM validation failures, provider failures, token usage, and cost signals emit structured JSON logs.
- Pipeline phase measurements also create OpenTelemetry API spans, ready for a future SDK/exporter configuration.
- Cost anomaly signals are emitted when completed usage exceeds the approved estimate or crosses the local warning threshold.
- Market Research Agent is gated behind paid workspace tiers (`pro` or `business`).
- The research layer uses a provider abstraction with a safe mock provider for local development.
- `RESEARCH_PROVIDER=tavily` enables an external Tavily research adapter when `TAVILY_API_KEY` is configured.
- Tavily results are normalized into citation documents and still pass through Shield scanning before prompts see them.
- Retrieved research content is Shield-scanned and sanitized before it reaches downstream prompts.
- Market Research output includes citations and sanitized research documents in `roleSpecificInsights`.
- Prompt regression cases cover triage, base agents, Moderator, and generated artifacts.
- `npm run eval:prompts --workspace @ai-war-room/api` evaluates schema validity, clarity, artifact usefulness, and prompt version drift.
- Advanced Shield uses a classifier interface with deterministic fallback.
- Critical input threats are blocked before draft execution and emit abuse/quota-impact signals.
- Low-risk review cases remain quiet, while false-positive review summary is available through `GET /api/shield/review-summary` for workspace owners and admins.
- Shield adversarial regression cases cover malicious retrieved pages, prompt injection, secret exfiltration, credential-like content, and benign false-positive controls.
- `runShieldAdversarialEvaluation` reports Shield status/category drift for the deterministic fallback classifier.
- Model Router chooses provider/model per role using registry capabilities, role support, quality, safety, reliability, cost, latency, and health.
- Candidate models are excluded from champion/deputy selection until they are promoted to `active`.
- LLM Gateway uses the role champion first and routes repair/retry attempts to the deputy model.
- Provider failures mark the selected model as degraded so future selections can avoid it.
- Model selection decisions emit structured observability events and `GET /api/model-router/registry` exposes the current registry snapshot.
- Model registry and model health events are persisted in PostgreSQL outside of test mode.
- `GET /api/model-router/registry/:modelId/health-events` returns degradation/recovery audit events.
- `POST /api/model-router/registry/:modelId/recover` resets a degraded model to healthy for recovery workflows (owner/admin only).
- Anthropic and OpenAI provider adapters are available behind the same LLM Gateway contract.
- Real provider API keys are read from local `.env` variables and must not be committed.
- Anthropic/OpenAI registry entries remain `candidate` by default and become active only when selected through `LLM_PRIMARY_PROVIDER` or `LLM_FALLBACK_PROVIDER`.
- Workspace owners/admins can add, edit, delete, and test provider keys from the frontend Provider Keys panel.
- Workspace provider keys are sent directly to the backend, encrypted with `APP_ENCRYPTION_KEY`, and stored in PostgreSQL.
- The frontend only receives masked keys such as `sk-...1234`; full keys are never returned after save.
- If no workspace or backend provider key exists, the frontend shows a first-connect setup prompt with Anthropic/OpenAI instructions.
- Temporal SDK packages are installed as API dev dependencies for the first durable workflow skeleton.
- `durableRunWorkflow` validates approved run input, then executes the existing pipeline through Temporal activities.
- The Temporal worker is a separate process and does not change current REST/SSE execution behavior yet.
- Temporal worker config is controlled through `TEMPORAL_ENABLED`, `TEMPORAL_ADDRESS`, `TEMPORAL_NAMESPACE`, and `TEMPORAL_TASK_QUEUE`.
- `POST /api/runs/workflows` starts an approved run as a Temporal workflow when `TEMPORAL_ENABLED=true`.
- `GET /api/runs/workflows/:workflowId/status` queries Temporal workflow status for the current workspace.
- Temporal workflow start/status endpoints return a clear `503` while Temporal is disabled, so local development and tests do not require a Temporal server.
- Started Temporal workflows are persisted in `run_workflows` with workspace id, run id, workflow id, Temporal run id, task queue, status, and timestamps.
- Status checks update persisted workflow metadata and publish `workflow_status` events into the existing run stream buffer.
- `GET /api/runs/workflows/:workflowId/observation` returns the persisted workflow metadata for the current workspace.
- `GET /api/runs/workflows/:workflowId/stream` streams/replays workflow status events with `Last-Event-ID` support.
- The frontend keeps the existing direct REST/SSE pipeline as the fallback runtime path when Temporal is disabled.
- `VITE_USE_TEMPORAL_WORKFLOWS=auto` is the default frontend preference and follows API runtime capabilities.
- `VITE_USE_TEMPORAL_WORKFLOWS=true` or `false` can still force Temporal or direct execution locally.
- In Temporal runtime mode, the frontend observes workflow status and loads generated artifacts from persisted artifact history after completion.
- `POST /api/runs/workflows/:workflowId/recover` re-syncs workflow metadata from Temporal and returns recovery guidance.
- `GET /api/runs/workflows/by-run/:runId` returns the latest persisted workflow metadata for a run in the current workspace.
- The frontend stores active Temporal workflow metadata locally, supports `Resume observation`, and uses `VITE_TEMPORAL_OBSERVATION_TIMEOUT_MS` for poll timeouts.
- Temporal activities buffer `status`, `artifact`, and `completed` pipeline stream events into the same Redis/in-memory run stream used by direct SSE execution.
- `GET /api/runs/temporal/health` helps verify Temporal server reachability and worker heartbeat before executing approved runs.

To enable real providers locally, copy `.env.example` to `.env`, add provider keys, and explicitly select the provider/model:

```bash
LLM_PRIMARY_PROVIDER=anthropic
LLM_PRIMARY_MODEL=claude-3-5-sonnet-latest
ANTHROPIC_API_KEY=...
```

For user-managed workspace keys, use the Provider Keys panel in the web app.

To enable external research locally:

```bash
RESEARCH_PROVIDER=tavily
TAVILY_API_KEY=...
```

To run the Temporal runtime path against a local Temporal server, set both backend and frontend flags, run the API, and start the worker in a separate terminal:

```bash
TEMPORAL_ENABLED=true npm run dev:api
VITE_USE_TEMPORAL_WORKFLOWS=true npm run dev:web
npm run worker:temporal:dev
```

