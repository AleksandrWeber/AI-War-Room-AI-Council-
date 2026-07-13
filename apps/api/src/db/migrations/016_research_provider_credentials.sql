-- Allow research BYOK providers alongside LLM keys in the same credentials table.
ALTER TABLE workspace_provider_credentials
  DROP CONSTRAINT IF EXISTS workspace_provider_credentials_provider_id_check;

ALTER TABLE workspace_provider_credentials
  ADD CONSTRAINT workspace_provider_credentials_provider_id_check
  CHECK (provider_id IN ('anthropic', 'openai', 'tavily', 'serper'));
