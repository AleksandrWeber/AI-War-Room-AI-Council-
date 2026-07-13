INSERT INTO workspace_usage_limits (
  workspace_id,
  paid_tier,
  daily_token_limit,
  daily_cost_limit_usd
)
VALUES ('secondary_workspace', 'free', 250000, 25.0000)
ON CONFLICT (workspace_id) DO NOTHING;

INSERT INTO billing_records (
  billing_record_id,
  workspace_id,
  provider,
  paid_tier,
  status
)
VALUES (
  'billing_secondary_workspace',
  'secondary_workspace',
  'stripe',
  'free',
  'draft'
)
ON CONFLICT (billing_record_id) DO NOTHING;
