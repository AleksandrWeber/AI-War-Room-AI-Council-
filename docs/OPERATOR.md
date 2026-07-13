# Operator and deployment guide

Runbook for bringing up infrastructure, applying migrations, checking readiness, and handling common incidents. Product detail remains in the root [README](../README.md).

## Stack topology

| Component | Local default | Role |
| --- | --- | --- |
| PostgreSQL | `postgres://ai_war_room:ai_war_room@127.0.0.1:5432/ai_war_room` | Source of truth (runs, auth, billing, artifacts, overrides). |
| Redis | `redis://127.0.0.1:6379` | Idempotency cache, SSE/stream buffers, short-lived run state. |
| API | `:3000` | NestJS Fastify; runs migrations on Docker start. |
| Web | `:5173` (dev) / `:8080` (compose nginx) | Vite UI; production image proxies `/api`. |
| Temporal (optional) | `127.0.0.1:7233` | Durable approved-run workflows + worker. |

## Deploy paths

### Local infra only

```bash
npm run infra:up
npm run db:migrate
npm run db:migrate -- --status
```

### Compose API stack

```bash
npm run docker:build
npm run docker:up:stack          # postgres + redis + api
npm run docker:up:full           # + web on :8080
npm run docker:up:temporal       # + temporal-worker (needs Temporal at host.docker.internal:7233)
```

Required API env in production containers:

- `DATABASE_URL`
- `REDIS_URL`
- `APP_ENCRYPTION_KEY` (must not be the local default)
- `WEB_ORIGIN`

Also set provider/auth/billing flags intentionally — production startup rejects mock LLM, mock research, and the default encryption key when those surfaces are active.

## Health and readiness

| Probe | Purpose |
| --- | --- |
| `GET /api/health` | Liveness |
| `GET /api/health/ready` | PostgreSQL + Redis; includes Temporal reachability when `TEMPORAL_ENABLED=true` |

Domain readiness (operator checklists; used by admin panels and CI-style smoke):

- Auth — `GET /api/auth/readiness`
- Billing — `GET /api/billing/readiness`
- LLM — `GET /api/llm/readiness`
- Temporal — `GET /api/runs/temporal/readiness`
- Shield — `GET /api/shield/readiness`
- Provider credentials — `GET /api/provider-credentials/readiness`
- Migrations — `GET /api/migrations/readiness`
- Deployment — `GET /api/deployment/readiness`
- Incidents — `GET /api/incidents/readiness`
- Observability — `GET /api/observability/readiness`

Treat `not_ready` as a deploy blocker for that domain. Prefer fixing config/keys before forcing traffic.

## Migrations

```bash
npm run db:migrate                 # apply pending
npm run db:migrate -- --status     # applied vs pending (no writes)
npm run db:migrate -- --dry-run    # plan without apply
```

Rules:

- One SQL file = one transaction (`BEGIN` / `COMMIT`; `ROLLBACK` on failure).
- Forward-only — no automatic down migrations.
- Prefer additive changes (`CREATE INDEX IF NOT EXISTS`, nullable columns, new tables).
- Production rollback: restore PostgreSQL from a pre-migration backup, redeploy the previous app revision, and keep `schema_migrations` consistent with that restore. Do not delete migration rows by hand unless the restore already undoes them.

## Temporal worker

When `TEMPORAL_ENABLED=true`:

1. Temporal server must be reachable at `TEMPORAL_ADDRESS`.
2. Run a worker (`npm run worker:temporal` / compose `temporal-worker` profile).
3. Confirm `GET /api/runs/temporal/readiness` and worker heartbeat in observability admin.
4. Production rejects loopback Temporal addresses.

If workflows stick in `running` with empty stream replay, check worker health first, then Redis stream lag / backlog / observability admin alerts.

Stream lag vs backlog:

- **stream_lag** — non-terminal run streams with no new events for ≥ 60s.
- **stream_backlog** — non-terminal streams retaining ≥ 80 events (near Redis `MAXLEN~100` trim pressure).

Opt-in load probes (not part of `quality:gate`):

```bash
RUN_LOAD_TESTS=1 npm run test:load
```

Covers Redis XADD throughput, concurrent multi-run streams + lag budget, and PostgreSQL write pressure.

## Incident handling (first 15 minutes)

1. **API down / 503 ready** — check Postgres and Redis; inspect `GET /api/health/ready` body for which dependency failed.
2. **Auth failures after deploy** — confirm `AUTH_PROVIDER` and secrets; session mode depends on `APP_ENCRYPTION_KEY` (key rotation invalidates sessions).
3. **Provider / BYOK errors** — `GET /api/provider-credentials/readiness`; system env keys are required for platform readiness (BYOK is not a substitute). Changing `APP_ENCRYPTION_KEY` without re-encrypt orphans stored keys.
4. **Billing webhook duplicates / missed upgrades** — inspect workspace webhook-events admin; events are idempotent by external id.
5. **Shield blocks / override disputes** — use Shield override with reason (audit trail); review workspace Shield admin false-positive summary. Production FP budget is **≤ 5%** on the review set (`docs/PRODUCT_POLICIES.md`). Secrets/PII finding quotes are redacted in PostgreSQL.
6. **Pipeline hang** — Temporal readiness + worker; otherwise direct run path and SSE stream readiness; check observability admin for stream lag / provider failure alerts. Market research failures are fail-soft (pipeline continues without live research).
7. **Bad migration in prod** — stop rolling forward; restore backup + previous revision; re-plan an additive fix migration.

Workspace owner/admin tools for many of these domains live under the web billing/admin panels (`/api/.../workspace/:workspaceId/admin`).

## CI expectations

GitHub Actions runs `quality:gate` plus Playwright E2E. Operators should not ship images that fail:

```bash
npm run quality:gate
```

Optional post-deploy smoke: hit `/api/health/ready` and the readiness endpoints for domains you enabled in that environment.
