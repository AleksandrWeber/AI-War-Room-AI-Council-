# Artifacts, export, and billing/usage

Developer-facing contracts for pipeline outputs and workspace metering. Schemas live in `@ai-war-room/schemas`; this doc is the map, not a second source of truth.

## Artifact pipeline order

Artifacts are generated **sequentially** after moderator synthesis:

```text
Moderator synthesis
  -> Executive Summary
  -> PRD          (uses moderator + prior artifacts context)
  -> Development Prompt  (must take the completed PRD as direct input)
```

Types (`artifactType`): `executive_summary` | `prd` | `development_prompt`.

### Schema entry points

| Artifact | Schema module | Key fields |
| --- | --- | --- |
| Executive Summary | `packages/schemas/src/artifact.ts` → `executiveSummarySchema` | productIdea, targetUsers, recommendation (`go` / `no_go` / `revise`) |
| PRD | `prdSchema` | goals, MVP scope, functional/non-functional requirements |
| Development Prompt | `developmentPromptSchema` | `targetTool`, stack, modules, implementation order, `toolSpecificGuidance`, outOfScope |

**Target tool (product decision 2026-07-13):** MVP is **Cursor-first** — one Cursor-optimized Development Prompt derived from the PRD. Human Review sends `developmentPromptTargetTool` (default `cursor`). Non-Cursor values currently attach scaffolding guidance only; full Claude Code / Bolt / Lovable adapters remain TODO §10. Do not fork the PRD per tool.

Persisted envelope:

- `artifactMetadataSchema` — ids, versions, model, token usage, cost, Shield status, validation status (`valid` | `repaired` | `fallback`)
- `artifactContentSchema` — discriminated union by `artifactType`

Change fields in schemas first, then regenerate/repair paths in the API and UI viewers.

## Export rules

Product decision: **PDF is the primary export format**; **Markdown is the lightweight secondary**.

Implemented today (API):

| Export | Endpoint / surface |
| --- | --- |
| Artifact PDF (primary) | `GET /api/runs/artifacts/:artifactId/export/pdf` |
| Artifact Markdown | `GET /api/runs/artifacts/:artifactId/export/markdown` |
| Artifact viewer + history UI | Export PDF and Export Markdown controls |
| Billing invoices | `GET /api/billing/workspace/:workspaceId/invoices/export?format=csv\|json` |
| Run history (admin) | `GET /api/runs/history/workspace/:workspaceId/admin/export?format=csv\|json` |
| Workspace audit (admin) | `GET /api/workspaces/:workspaceId/admin/audit/export?format=csv\|json` |

PDF and Markdown exports both reflect the **immutable persisted** artifact content (same section rendering), not a live LLM rewrite.

## Usage metering

Schemas: `packages/schemas/src/usage.ts`.

- Each billable phase emits a `usageEvent` (`agent`, `moderator`, `executive_summary`, `prd`, `development_prompt`) with token counts and `estimatedCostUsd`.
- Workspace limits (`workspaceUsageLimitSchema`) key off `paidTier`: `free` | `pro` | `business` (daily token + cost caps).
- Limits are enforced server-side; UI surfaces remaining budget via usage/billing panels.

## Run / artifact feedback

Lightweight usefulness loop (schemas: `packages/schemas/src/run-feedback.ts`):

| Rating | Meaning |
| --- | --- |
| `useful` | Ready to act on |
| `partially_useful` | Needs edits but directionally right |
| `not_useful` | Missed the mark |

- `POST /api/runs/feedback` — upsert per workspace user + target (`run` or `artifact`); optional comment ≤ 1000 chars.
- `GET /api/runs/:runId/feedback` — list feedback for a run.
- UI: artifact viewer rating buttons + overall run rating after completion.
- Persisted in `run_feedback` (migration `013_run_feedback.sql`); observability event `run_feedback_recorded`.

## Billing behavior

Schemas: `packages/schemas/src/billing.ts`. Capabilities: `GET /api/billing/capabilities`.

| Mode | How |
| --- | --- |
| Disabled (default) | `STRIPE_ENABLED=false` |
| Local mock | `STRIPE_ENABLED=true` + `STRIPE_BILLING_ADAPTER=mock` |
| Stripe | `STRIPE_ENABLED=true` + `STRIPE_BILLING_ADAPTER=stripe` + live keys/price ids |

Important behaviors:

- Checkout metadata carries `workspaceId` + `paidTier`; webhooks upgrade limits idempotently by external event id.
- Duplicate webhooks return `{ duplicate: true }` without re-applying tier changes.
- Customer portal: `POST /api/billing/customer-portal-session` (mock inline vs Stripe hosted).
- Metered usage reporting is optional (`STRIPE_METERED_USAGE_ENABLED`); reports appear under billing meter APIs when enabled.
- Production readiness: `GET /api/billing/readiness` (and workspace billing admin for owners/admins).

Local smoke:

```bash
STRIPE_ENABLED=true STRIPE_BILLING_ADAPTER=mock npm run dev:api
npm run dev:web
# open Workspace Billing → Upgrade to Pro
```

## Related readiness

- Run history / artifact persistence — `GET /api/runs/history/readiness`
- Usage limits — `GET /api/usage/limits/readiness`
- Billing — `GET /api/billing/readiness`

See also [CONTRIBUTING.md](./CONTRIBUTING.md) and [OPERATOR.md](./OPERATOR.md).
