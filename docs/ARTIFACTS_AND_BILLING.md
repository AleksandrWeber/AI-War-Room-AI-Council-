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
| Development Prompt | `developmentPromptSchema` | stack, modules, implementation order, outOfScope |

Persisted envelope:

- `artifactMetadataSchema` — ids, versions, model, token usage, cost, Shield status, validation status (`valid` | `repaired` | `fallback`)
- `artifactContentSchema` — discriminated union by `artifactType`

Change fields in schemas first, then regenerate/repair paths in the API and UI viewers.

## Export rules

Product decision: **PDF is the primary export format**; **Markdown is the lightweight secondary**.

Implemented today (API):

| Export | Endpoint / surface |
| --- | --- |
| Artifact Markdown | `GET /api/runs/artifacts/:artifactId/export/markdown` |
| Artifact History UI | Markdown export controls on the history panel |
| Billing invoices | `GET /api/billing/workspace/:workspaceId/invoices/export?format=csv\|json` |
| Run history (admin) | `GET /api/runs/history/workspace/:workspaceId/admin/export?format=csv\|json` |
| Workspace audit (admin) | `GET /api/workspaces/:workspaceId/admin/audit/export?format=csv\|json` |

Markdown export must reflect the **immutable persisted** artifact content, not a live LLM rewrite. PDF generation should consume the same validated content when wired for a surface.

## Usage metering

Schemas: `packages/schemas/src/usage.ts`.

- Each billable phase emits a `usageEvent` (`agent`, `moderator`, `executive_summary`, `prd`, `development_prompt`) with token counts and `estimatedCostUsd`.
- Workspace limits (`workspaceUsageLimitSchema`) key off `paidTier`: `free` | `pro` | `business` (daily token + cost caps).
- Limits are enforced server-side; UI surfaces remaining budget via usage/billing panels.

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
