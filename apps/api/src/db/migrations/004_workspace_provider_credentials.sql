CREATE TABLE IF NOT EXISTS workspace_provider_credentials (
  credential_id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces (workspace_id) ON DELETE CASCADE,
  provider_id TEXT NOT NULL CHECK (provider_id IN ('anthropic', 'openai')),
  label TEXT NOT NULL,
  encrypted_api_key TEXT NOT NULL,
  key_hint TEXT NOT NULL,
  created_by_user_id TEXT NOT NULL REFERENCES app_users (user_id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_tested_at TIMESTAMPTZ,
  last_test_status TEXT NOT NULL DEFAULT 'untested' CHECK (
    last_test_status IN ('untested', 'passed', 'failed')
  ),
  last_test_error TEXT,
  UNIQUE (workspace_id, provider_id)
);

CREATE INDEX IF NOT EXISTS workspace_provider_credentials_workspace_idx
  ON workspace_provider_credentials (workspace_id);
