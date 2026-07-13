# Product policies (locked 2026-07-13)

Operational product decisions that shape Shield, storage, and research. Implementation backlog items that remain unfinished are noted as “enforce”.

## Development Prompt target

- **MVP:** Cursor-first — one Cursor-optimized Development Prompt from the PRD.
- **Post-MVP:** multi-tool adapters (Claude Code, Bolt, Lovable). See TODO §10.

## Shield false-positive policy

- **User UX:** low/medium stay quiet or light; high visible in Human Review; critical/blocked require owner/admin **override + reason** (no MVP “dismiss forever” / mark-as-FP button).
- **Quality control:** owner/admin runs the false-positive **review set**; production readiness enforces **false-positive rate ≤ 5%** on that set (failures that are only FPs within budget do not block the regression check).
- **Observability:** log severity, category, override yes/no — not raw secret plaintext.
- **Post-MVP:** explicit “Mark as false positive” → review queue + per-workspace sensitivity.

## Shield storage policy

- **Durable:** scan id, status, maxSeverity, categories, finding ids, recommendedAction, override audit.
- **At rest (PostgreSQL findings JSON):** for `secrets` and `pii`, redact `span.quote` to `[REDACTED]` and neutralize explanations that would restate the secret. Offsets may remain so Human Review can highlight against stored `idea.rawIdea` during the run lifetime.
- **Ephemeral:** unredacted highlights live in the API response / client session for review; purged with run retention (30d draft / 180d completed + 30d grace).
- **Exports:** audit exports must not include raw secret quotes.
- **Post-MVP:** optional short full-scan retain window for enterprise disputes.

## External research provider strategy

- **Local default:** `RESEARCH_PROVIDER=mock`.
- **Production live adapter:** **Tavily only** in MVP (`RESEARCH_PROVIDER=tavily` + `TAVILY_API_KEY`). Production rejects `mock`.
- **Availability:** research remains available without waiting for paid tiers (including free workspaces); usage metered to the workspace; platform system key for MVP.
- **Failure mode:** **fail-soft** — if live research throws / is unavailable, Market Research Agent continues with a degraded note; the pipeline is not blocked.
- **Trust:** retrieved content is Shield-scanned before agent consumption (existing path).
- **Post-MVP:** BYOK research keys; second-provider failover behind the same adapter interface.

## Real LLM opt-in

- **Local/default:** `LLM_*_PROVIDER=mock` — no paid API calls.
- **Local real providers:** require `LLM_ALLOW_REAL_PROVIDERS=true` plus provider selection and API keys. Startup and gateway both enforce this outside production.
- **Production:** non-mock primary is required; the local opt-in flag is not needed.
