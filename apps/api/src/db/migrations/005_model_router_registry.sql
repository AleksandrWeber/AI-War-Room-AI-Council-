CREATE TABLE IF NOT EXISTS model_registry_entries (
  model_id TEXT PRIMARY KEY,
  provider_id TEXT NOT NULL CHECK (provider_id IN ('mock', 'anthropic', 'openai')),
  model_name TEXT NOT NULL,
  supported_roles JSONB NOT NULL,
  context_window_tokens INTEGER NOT NULL CHECK (context_window_tokens > 0),
  max_output_tokens INTEGER NOT NULL CHECK (max_output_tokens > 0),
  input_cost_per_million_tokens_usd NUMERIC(12, 6) NOT NULL CHECK (input_cost_per_million_tokens_usd >= 0),
  output_cost_per_million_tokens_usd NUMERIC(12, 6) NOT NULL CHECK (output_cost_per_million_tokens_usd >= 0),
  latency_p95_ms INTEGER NOT NULL CHECK (latency_p95_ms > 0),
  evaluation_score NUMERIC(5, 4) NOT NULL CHECK (evaluation_score >= 0 AND evaluation_score <= 1),
  safety_score NUMERIC(5, 4) NOT NULL CHECK (safety_score >= 0 AND safety_score <= 1),
  reliability_score NUMERIC(5, 4) NOT NULL CHECK (reliability_score >= 0 AND reliability_score <= 1),
  lifecycle_status TEXT NOT NULL CHECK (lifecycle_status IN ('active', 'candidate', 'degraded', 'disabled')),
  health_status TEXT NOT NULL CHECK (health_status IN ('healthy', 'degraded', 'over_quota', 'unavailable')),
  consecutive_failures INTEGER NOT NULL DEFAULT 0 CHECK (consecutive_failures >= 0),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS model_registry_entries_provider_idx
  ON model_registry_entries (provider_id);

CREATE INDEX IF NOT EXISTS model_registry_entries_status_idx
  ON model_registry_entries (lifecycle_status, health_status);

CREATE TABLE IF NOT EXISTS model_health_events (
  event_id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL REFERENCES model_registry_entries (model_id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('degraded', 'recovered')),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS model_health_events_model_created_idx
  ON model_health_events (model_id, created_at DESC);

INSERT INTO model_registry_entries (
  model_id,
  provider_id,
  model_name,
  supported_roles,
  context_window_tokens,
  max_output_tokens,
  input_cost_per_million_tokens_usd,
  output_cost_per_million_tokens_usd,
  latency_p95_ms,
  evaluation_score,
  safety_score,
  reliability_score,
  lifecycle_status,
  health_status,
  consecutive_failures
)
VALUES
  (
    'mock-json-v1-primary',
    'mock',
    'mock-json-v1',
    '["triage","product_manager","critic","moderator","security_expert","software_architect","market_researcher","mobile_ux_expert","executive_summary","prd","development_prompt","shield_classifier"]'::jsonb,
    128000,
    8192,
    0,
    0,
    500,
    0.88,
    0.85,
    0.98,
    'active',
    'healthy',
    0
  ),
  (
    'mock-json-v1-deputy',
    'mock',
    'mock-json-v1-deputy',
    '["triage","product_manager","critic","moderator","security_expert","software_architect","market_researcher","mobile_ux_expert","executive_summary","prd","development_prompt","shield_classifier"]'::jsonb,
    128000,
    8192,
    0,
    0,
    650,
    0.82,
    0.82,
    0.96,
    'active',
    'healthy',
    0
  ),
  (
    'mock-json-v2-candidate',
    'mock',
    'mock-json-v2-candidate',
    '["triage","product_manager","critic","moderator","security_expert","software_architect","market_researcher","mobile_ux_expert","executive_summary","prd","development_prompt","shield_classifier"]'::jsonb,
    128000,
    8192,
    0,
    0,
    350,
    0.99,
    0.99,
    0.99,
    'candidate',
    'healthy',
    0
  ),
  (
    'anthropic-sonnet-candidate',
    'anthropic',
    'claude-3-5-sonnet-latest',
    '["triage","product_manager","critic","moderator","security_expert","software_architect","market_researcher","mobile_ux_expert","executive_summary","prd","development_prompt","shield_classifier"]'::jsonb,
    200000,
    8192,
    3,
    15,
    2500,
    0.94,
    0.92,
    0.92,
    'candidate',
    'healthy',
    0
  ),
  (
    'openai-fast-candidate',
    'openai',
    'gpt-4o-mini',
    '["triage","product_manager","critic","moderator","security_expert","software_architect","market_researcher","mobile_ux_expert","executive_summary","prd","development_prompt","shield_classifier"]'::jsonb,
    128000,
    16384,
    0.15,
    0.6,
    1200,
    0.86,
    0.84,
    0.9,
    'candidate',
    'healthy',
    0
  )
ON CONFLICT (model_id) DO NOTHING;
