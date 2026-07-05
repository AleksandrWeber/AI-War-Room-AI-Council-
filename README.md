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

Run the local persistence gate:

```bash
npm run quality:infra
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

