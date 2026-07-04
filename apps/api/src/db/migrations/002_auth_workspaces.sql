CREATE TABLE IF NOT EXISTS app_users (
  user_id TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  display_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspaces (
  workspace_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workspace_memberships (
  workspace_id TEXT NOT NULL REFERENCES workspaces (workspace_id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES app_users (user_id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE INDEX IF NOT EXISTS workspace_memberships_user_id_idx
  ON workspace_memberships (user_id);

INSERT INTO app_users (user_id, email, display_name)
VALUES ('user_local', 'local@ai-war-room.dev', 'Local Developer')
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO workspaces (workspace_id, name)
VALUES ('local_workspace', 'Local Workspace')
ON CONFLICT (workspace_id) DO NOTHING;

INSERT INTO workspace_memberships (workspace_id, user_id, role)
VALUES ('local_workspace', 'user_local', 'owner')
ON CONFLICT (workspace_id, user_id) DO NOTHING;
