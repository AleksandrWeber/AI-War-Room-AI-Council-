-- Aligns with listArtifacts:
--   WHERE workspace_id = $1
--   ORDER BY created_at DESC, artifact_type ASC
CREATE INDEX IF NOT EXISTS artifacts_workspace_created_type_idx
  ON artifacts (workspace_id, created_at DESC, artifact_type);

-- Aligns with listIdempotencyRecords / purgeExpiredIdempotencyKeys:
--   WHERE workspace_id = $1 ORDER BY expires_at DESC
--   DELETE WHERE workspace_id = $1 AND expires_at < NOW()
CREATE INDEX IF NOT EXISTS idempotency_keys_workspace_expires_at_idx
  ON idempotency_keys (workspace_id, expires_at DESC);
