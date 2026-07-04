ALTER TABLE billing_records
  ADD COLUMN IF NOT EXISTS external_subscription_item_id TEXT;

CREATE TABLE IF NOT EXISTS billing_meter_usage_reports (
  billing_meter_usage_report_id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces (workspace_id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'stripe',
  external_subscription_item_id TEXT,
  external_usage_record_id TEXT,
  metric TEXT NOT NULL CHECK (metric IN ('tokens')),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  status TEXT NOT NULL CHECK (status IN ('reported', 'skipped', 'failed')),
  error_message TEXT,
  run_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS billing_meter_usage_reports_workspace_created_idx
  ON billing_meter_usage_reports (workspace_id, created_at DESC);
