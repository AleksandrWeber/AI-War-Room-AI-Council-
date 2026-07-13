-- Allow Gemini as an LLM BYOK provider and model-registry provider.

ALTER TABLE workspace_provider_credentials
  DROP CONSTRAINT IF EXISTS workspace_provider_credentials_provider_id_check;

ALTER TABLE workspace_provider_credentials
  ADD CONSTRAINT workspace_provider_credentials_provider_id_check
  CHECK (provider_id IN ('anthropic', 'openai', 'gemini', 'tavily', 'serper'));

ALTER TABLE model_registry_entries
  DROP CONSTRAINT IF EXISTS model_registry_entries_provider_id_check;

ALTER TABLE model_registry_entries
  ADD CONSTRAINT model_registry_entries_provider_id_check
  CHECK (provider_id IN ('mock', 'anthropic', 'openai', 'gemini'));

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
VALUES (
  'gemini-flash-candidate',
  'gemini',
  'gemini-2.0-flash',
  '["triage","product_manager","critic","moderator","security_expert","software_architect","market_researcher","mobile_ux_expert","executive_summary","prd","development_prompt","shield_classifier"]'::jsonb,
  1048576,
  8192,
  0.1,
  0.4,
  900,
  0.87,
  0.86,
  0.91,
  'candidate',
  'healthy',
  0
)
ON CONFLICT (model_id) DO NOTHING;
