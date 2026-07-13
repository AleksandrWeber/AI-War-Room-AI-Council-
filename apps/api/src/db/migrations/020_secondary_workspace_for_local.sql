INSERT INTO workspaces (workspace_id, name)
VALUES ('secondary_workspace', 'Secondary Workspace')
ON CONFLICT (workspace_id) DO NOTHING;

INSERT INTO workspace_memberships (workspace_id, user_id, role)
VALUES ('secondary_workspace', 'user_local', 'member')
ON CONFLICT (workspace_id, user_id) DO NOTHING;
