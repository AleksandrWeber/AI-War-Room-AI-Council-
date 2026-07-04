CREATE TABLE IF NOT EXISTS workspace_usage_limits (
  workspace_id TEXT PRIMARY KEY REFERENCES workspaces (workspace_id) ON DELETE CASCADE,
  paid_tier TEXT NOT NULL CHECK (paid_tier IN ('free', 'pro', 'business')),
  daily_token_limit INTEGER NOT NULL CHECK (daily_token_limit > 0),
  daily_cost_limit_usd NUMERIC(12, 4) NOT NULL CHECK (daily_cost_limit_usd > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usage_events (
  usage_event_id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces (workspace_id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES app_users (user_id) ON DELETE CASCADE,
  run_id TEXT NOT NULL REFERENCES runs (run_id) ON DELETE CASCADE,
  phase TEXT NOT NULL CHECK (
    phase IN (
      'agent',
      'moderator',
      'executive_summary',
      'prd',
      'development_prompt'
    )
  ),
  source_id TEXT NOT NULL,
  model_provider TEXT NOT NULL,
  model_name TEXT NOT NULL,
  prompt_version TEXT NOT NULL,
  input_tokens INTEGER NOT NULL CHECK (input_tokens >= 0),
  output_tokens INTEGER NOT NULL CHECK (output_tokens >= 0),
  estimated_cost_usd NUMERIC(12, 6) NOT NULL CHECK (estimated_cost_usd >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS usage_events_workspace_created_idx
  ON usage_events (workspace_id, created_at);

CREATE INDEX IF NOT EXISTS usage_events_run_id_idx
  ON usage_events (run_id);

CREATE TABLE IF NOT EXISTS billing_records (
  billing_record_id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces (workspace_id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'stripe',
  external_customer_id TEXT,
  paid_tier TEXT NOT NULL CHECK (paid_tier IN ('free', 'pro', 'business')),
  status TEXT NOT NULL CHECK (status IN ('draft', 'active', 'past_due', 'canceled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS billing_records_workspace_idx
  ON billing_records (workspace_id);

INSERT INTO workspace_usage_limits (
  workspace_id,
  paid_tier,
  daily_token_limit,
  daily_cost_limit_usd
)
VALUES ('local_workspace', 'free', 250000, 25.0000)
ON CONFLICT (workspace_id) DO NOTHING;

INSERT INTO billing_records (
  billing_record_id,
  workspace_id,
  provider,
  paid_tier,
  status
)
VALUES ('billing_local_workspace', 'local_workspace', 'stripe', 'free', 'draft')
ON CONFLICT (billing_record_id) DO NOTHING;
