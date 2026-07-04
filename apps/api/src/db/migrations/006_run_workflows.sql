CREATE TABLE IF NOT EXISTS run_workflows (
  workflow_id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL REFERENCES runs (run_id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL,
  temporal_run_id TEXT,
  task_queue TEXT NOT NULL,
  status TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  last_checked_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS run_workflows_workspace_id_idx
  ON run_workflows (workspace_id);

CREATE INDEX IF NOT EXISTS run_workflows_run_id_idx
  ON run_workflows (run_id);

CREATE INDEX IF NOT EXISTS run_workflows_status_idx
  ON run_workflows (status);
