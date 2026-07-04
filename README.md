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

Current local auth is header-based until a real auth provider is selected:

- `x-user-id: user_local`
- `x-workspace-id: local_workspace`

Run mutation endpoints verify that the request workspace matches the header workspace and that the user is a workspace member.

## LLM Gateway

The API contains an internal LLM gateway abstraction for structured JSON calls.

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
- Billing records exist as Stripe-ready local records, but Stripe integration is intentionally deferred.
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
- The frontend keeps the existing direct REST/SSE pipeline as the default runtime path.
- `VITE_USE_TEMPORAL_WORKFLOWS=true` switches the Execute button to the Temporal workflow start/status/stream path.
- In Temporal runtime mode, the frontend observes workflow status and loads generated artifacts from persisted artifact history after completion.
- `POST /api/runs/workflows/:workflowId/recover` re-syncs workflow metadata from Temporal and returns recovery guidance.
- `GET /api/runs/workflows/by-run/:runId` returns the latest persisted workflow metadata for a run in the current workspace.
- The frontend stores active Temporal workflow metadata locally, supports `Resume observation`, and uses `VITE_TEMPORAL_OBSERVATION_TIMEOUT_MS` for poll timeouts.

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

