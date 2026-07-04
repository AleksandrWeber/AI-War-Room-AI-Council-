CREATE TABLE IF NOT EXISTS billing_notifications (
  billing_notification_id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces (workspace_id) ON DELETE CASCADE,
  alert_id TEXT NOT NULL,
  alert_type TEXT NOT NULL CHECK (
    alert_type IN (
      'usage_tokens',
      'usage_cost',
      'billing_past_due',
      'billing_canceled'
    )
  ),
  severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  message TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('mock', 'email')),
  status TEXT NOT NULL CHECK (status IN ('pending', 'delivered', 'failed')),
  delivery_reference TEXT,
  error_message TEXT,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, alert_id)
);

CREATE INDEX IF NOT EXISTS billing_notifications_workspace_created_idx
  ON billing_notifications (workspace_id, created_at DESC);
