CREATE TABLE IF NOT EXISTS shield_overrides (
  override_id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL UNIQUE,
  workspace_id TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  reason TEXT NOT NULL,
  finding_ids JSONB NOT NULL,
  scan_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS shield_overrides_workspace_id_idx
  ON shield_overrides (workspace_id);
