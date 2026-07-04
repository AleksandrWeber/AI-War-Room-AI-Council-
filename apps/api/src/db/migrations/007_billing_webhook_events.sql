CREATE TABLE IF NOT EXISTS billing_webhook_events (
  billing_webhook_event_id TEXT PRIMARY KEY,
  provider TEXT NOT NULL DEFAULT 'stripe',
  external_event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  workspace_id TEXT REFERENCES workspaces (workspace_id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (
    status IN ('received', 'processed', 'ignored', 'duplicate', 'failed')
  ),
  error_message TEXT,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS billing_webhook_events_workspace_received_idx
  ON billing_webhook_events (workspace_id, received_at DESC);
