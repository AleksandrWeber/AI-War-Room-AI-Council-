CREATE TABLE IF NOT EXISTS schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS runs (
  run_id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  status TEXT NOT NULL,
  idea JSONB NOT NULL,
  triage JSONB NOT NULL,
  selected_agents JSONB NOT NULL,
  estimated_duration_seconds INTEGER NOT NULL,
  estimated_max_cost_usd NUMERIC(12, 4) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS runs_workspace_id_idx ON runs (workspace_id);
CREATE INDEX IF NOT EXISTS runs_status_idx ON runs (status);

CREATE TABLE IF NOT EXISTS shield_scans (
  scan_id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES runs (run_id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  status TEXT NOT NULL,
  max_severity TEXT NOT NULL,
  findings JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS shield_scans_run_id_idx ON shield_scans (run_id);

CREATE TABLE IF NOT EXISTS idempotency_keys (
  workspace_id TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  run_id TEXT NOT NULL REFERENCES runs (run_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  PRIMARY KEY (workspace_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS idempotency_keys_run_id_idx ON idempotency_keys (run_id);
CREATE INDEX IF NOT EXISTS idempotency_keys_expires_at_idx ON idempotency_keys (expires_at);

CREATE TABLE IF NOT EXISTS agent_outputs (
  id BIGSERIAL PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES runs (run_id) ON DELETE CASCADE,
  agent_role TEXT NOT NULL,
  output JSONB NOT NULL,
  validation_status TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  model_provider TEXT NOT NULL,
  model_name TEXT NOT NULL,
  input_tokens INTEGER NOT NULL,
  output_tokens INTEGER NOT NULL,
  estimated_cost_usd NUMERIC(12, 4) NOT NULL,
  shield_scan JSONB,
  completed_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS agent_outputs_run_id_idx ON agent_outputs (run_id);

CREATE TABLE IF NOT EXISTS moderator_syntheses (
  run_id TEXT PRIMARY KEY REFERENCES runs (run_id) ON DELETE CASCADE,
  synthesis JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS artifacts (
  artifact_id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES runs (run_id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL,
  artifact_type TEXT NOT NULL,
  metadata JSONB NOT NULL,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS artifacts_run_id_idx ON artifacts (run_id);
CREATE INDEX IF NOT EXISTS artifacts_workspace_id_idx ON artifacts (workspace_id);
CREATE INDEX IF NOT EXISTS artifacts_type_idx ON artifacts (artifact_type);
