-- FP queue triage metadata + per-workspace Shield display sensitivity.
ALTER TABLE shield_false_positive_reports
  ADD COLUMN IF NOT EXISTS reviewed_by_user_id TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS review_note TEXT;

ALTER TABLE workspaces
  ADD COLUMN IF NOT EXISTS shield_display_sensitivity TEXT NOT NULL DEFAULT 'medium_and_up';

ALTER TABLE workspaces
  DROP CONSTRAINT IF EXISTS workspaces_shield_display_sensitivity_check;

ALTER TABLE workspaces
  ADD CONSTRAINT workspaces_shield_display_sensitivity_check
  CHECK (
    shield_display_sensitivity IN ('high_only', 'medium_and_up', 'all')
  );
