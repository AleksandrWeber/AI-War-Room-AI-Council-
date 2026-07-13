CREATE TABLE IF NOT EXISTS run_feedback (
  feedback_id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL,
  run_id TEXT NOT NULL,
  artifact_id TEXT,
  target_type TEXT NOT NULL,
  target_key TEXT NOT NULL,
  actor_user_id TEXT NOT NULL,
  usefulness TEXT NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, actor_user_id, target_type, target_key)
);

CREATE INDEX IF NOT EXISTS run_feedback_workspace_run_idx
  ON run_feedback (workspace_id, run_id, created_at DESC);

CREATE INDEX IF NOT EXISTS run_feedback_workspace_created_idx
  ON run_feedback (workspace_id, created_at DESC);
