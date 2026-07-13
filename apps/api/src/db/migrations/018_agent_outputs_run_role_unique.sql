-- Ensure one durable agent output row per role per run (regenerate replaces in place).
CREATE UNIQUE INDEX IF NOT EXISTS agent_outputs_run_id_agent_role_uidx
  ON agent_outputs (run_id, agent_role);
