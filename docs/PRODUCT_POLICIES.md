# Product policies (locked 2026-07-13)

Operational product decisions that shape Shield, storage, and research. Implementation backlog items that remain unfinished are noted as “enforce”.

## Development Prompt target

- **MVP:** Cursor-first — one Cursor-optimized Development Prompt from the PRD. Human Review can select `targetTool` (`cursor` default; `claude_code` / `bolt` / `lovable` use tool-specific guidance profiles).
- **Schema:** `developmentPromptSchema.targetTool` + `toolSpecificGuidance`; pipeline request field `developmentPromptTargetTool`.
- **Adapters:** Cursor / Claude Code / Bolt / Lovable guidance lives in `development-prompt-targets.ts` (shared PRD; no per-tool PRD fork).

## Shield false-positive policy

- **User UX:** low/medium stay quiet or light; high visible in Human Review; critical/blocked require owner/admin **override + reason**. Non-critical findings may be **marked as false positive** into an owner/admin review queue (does not change scan status or unlock critical runs). Owners/admins can **accept/reject** queue items.
- **Display sensitivity:** workspace setting `shieldDisplaySensitivity` (`high_only` | `medium_and_up` default | `all`) filters which findings Human Review surfaces; critical always remains visible.
- **Detection layers:** Layer 1 deterministic classifier always runs. Layer 2 LLM escalation (`SHIELD_LLM_ESCALATION_ENABLED`, default on) runs when deterministic finds hits or high-risk domain cues; fail-soft back to Layer 1 on LLM errors. FP review set stays deterministic-only for stable ≤5% rate checks.
- **Quality control:** owner/admin runs the false-positive **review set**; production readiness enforces **false-positive rate ≤ 5%** on that set (failures that are only FPs within budget do not block the regression check).
- **Observability:** log severity, category, override yes/no — not raw secret plaintext. User FP reports emit `shield_false_positive_reported`; triage emits `shield_false_positive_resolved`. Layer 2 emits `shield_llm_escalation` / `shield_llm_escalation_failed`.

## Shield storage policy

- **Durable:** scan id, status, maxSeverity, categories, finding ids, recommendedAction, override audit.
- **At rest (PostgreSQL findings JSON):** for `secrets` and `pii`, redact `span.quote` to `[REDACTED]` and neutralize explanations that would restate the secret. Offsets may remain so Human Review can highlight against stored `idea.rawIdea` during the run lifetime.
- **Ephemeral:** unredacted highlights live in the API response / client session for review; purged with run retention (30d draft / 180d completed + 30d grace).
- **Exports:** audit exports must not include raw secret quotes.
- **Enterprise full-scan retain (business tier):** when `SHIELD_FULL_SCAN_RETAIN_ENABLED=true`, unredacted secrets/PII findings are also stored in `shield_scan_full_findings` for `SHIELD_FULL_SCAN_RETAIN_HOURS` (default **72h**). Owner/admin dispute read: `GET /api/shield/workspace/:id/scans/:scanId/full`. Expired retains are redacted via admin action `purge_expired_full_scans`. Durable `shield_scans.findings` stay redacted.

## External research provider strategy

- **Local default:** `RESEARCH_PROVIDER=mock`.
- **Production live adapter:** **Tavily** (`RESEARCH_PROVIDER=tavily` + `TAVILY_API_KEY`). Production rejects `mock`.
- **BYOK:** workspace encrypted keys for `tavily` / `serper` via Provider Keys (same `workspace_provider_credentials` table); preferred over platform env keys at search time.
- **Failover:** optional `RESEARCH_SECONDARY_PROVIDER=serper` wraps Tavily → Serper behind `FailoverResearchProvider`; Market Research still **fail-soft** if all providers fail.
- **Availability:** research remains available without waiting for paid tiers (including free workspaces); usage metered to the workspace.
- **Trust:** retrieved content is Shield-scanned before agent consumption (existing path).

## Real LLM opt-in

- **Local/default:** `LLM_*_PROVIDER=mock` — no paid API calls.
- **Local real providers:** require `LLM_ALLOW_REAL_PROVIDERS=true` plus provider selection and API keys. Startup and gateway both enforce this outside production.
- **Production:** non-mock primary is required; the local opt-in flag is not needed.
