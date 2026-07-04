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

Run mutation endpoints verify that the request workspace matches the header workspace and that the user is a workspace member.

## LLM Gateway

The API contains an internal LLM gateway abstraction for structured JSON calls.

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
- Low-risk review cases remain quiet, while false-positive review summary is available through `GET /api/shield/review-summary`.
- Shield adversarial regression cases cover malicious retrieved pages, prompt injection, secret exfiltration, credential-like content, and benign false-positive controls.
- `runShieldAdversarialEvaluation` reports Shield status/category drift for the deterministic fallback classifier.
- Model Router chooses provider/model per role using registry capabilities, role support, quality, safety, reliability, cost, latency, and health.
- Candidate models are excluded from champion/deputy selection until they are promoted to `active`.
- LLM Gateway uses the role champion first and routes repair/retry attempts to the deputy model.
- Provider failures mark the selected model as degraded so future selections can avoid it.
- Model selection decisions emit structured observability events and `GET /api/model-router/registry` exposes the current registry snapshot.
- Model registry and model health events are persisted in PostgreSQL outside of test mode.
- `GET /api/model-router/registry/:modelId/health-events` returns degradation/recovery audit events.
- `POST /api/model-router/registry/:modelId/recover` resets a degraded model to healthy for recovery workflows.
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

