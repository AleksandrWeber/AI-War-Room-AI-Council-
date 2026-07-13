CREATE TABLE IF NOT EXISTS workspace_invites (
  invite_id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces (workspace_id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'member', 'viewer')),
  token_hash TEXT NOT NULL UNIQUE,
  invited_by_user_id TEXT NOT NULL REFERENCES app_users (user_id),
  expires_at TIMESTAMPTZ NOT NULL,
  accepted_at TIMESTAMPTZ,
  accepted_by_user_id TEXT REFERENCES app_users (user_id),
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS workspace_invites_workspace_id_idx
  ON workspace_invites (workspace_id);

CREATE INDEX IF NOT EXISTS workspace_invites_email_idx
  ON workspace_invites (lower(email));
