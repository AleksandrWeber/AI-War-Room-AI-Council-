CREATE TABLE IF NOT EXISTS billing_invoices (
  billing_invoice_id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces (workspace_id) ON DELETE CASCADE,
  provider TEXT NOT NULL DEFAULT 'stripe',
  external_invoice_id TEXT NOT NULL UNIQUE,
  external_customer_id TEXT,
  paid_tier TEXT CHECK (paid_tier IN ('free', 'pro', 'business')),
  amount_total_usd NUMERIC(12, 2) NOT NULL CHECK (amount_total_usd >= 0),
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (
    status IN ('draft', 'open', 'paid', 'void', 'uncollectible', 'failed')
  ),
  hosted_invoice_url TEXT,
  invoice_pdf_url TEXT,
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS billing_invoices_workspace_created_idx
  ON billing_invoices (workspace_id, created_at DESC);
