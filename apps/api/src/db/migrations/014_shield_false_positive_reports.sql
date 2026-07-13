CREATE TABLE IF NOT EXISTS shield_false_positive_reports (
  report_id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  run_id TEXT NOT NULL,
  scan_id TEXT NOT NULL,
  finding_id TEXT NOT NULL,
  severity TEXT NOT NULL,
  category TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, run_id, finding_id)
);

CREATE INDEX IF NOT EXISTS shield_fp_reports_workspace_status_idx
  ON shield_false_positive_reports (workspace_id, status, created_at DESC);

CREATE INDEX IF NOT EXISTS shield_fp_reports_workspace_run_idx
  ON shield_false_positive_reports (workspace_id, run_id, created_at DESC);
