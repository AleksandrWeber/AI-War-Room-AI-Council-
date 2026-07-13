CREATE TABLE IF NOT EXISTS shield_scan_full_findings (
  scan_id TEXT PRIMARY KEY REFERENCES shield_scans (scan_id) ON DELETE CASCADE,
  workspace_id TEXT NOT NULL,
  run_id TEXT NOT NULL,
  findings JSONB NOT NULL,
  retain_until TIMESTAMPTZ NOT NULL,
  redacted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS shield_scan_full_findings_retain_idx
  ON shield_scan_full_findings (retain_until)
  WHERE redacted_at IS NULL;

CREATE INDEX IF NOT EXISTS shield_scan_full_findings_workspace_idx
  ON shield_scan_full_findings (workspace_id, created_at DESC);
