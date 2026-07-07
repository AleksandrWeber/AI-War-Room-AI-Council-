export const milestones = [
  {
    name: 'registryjournalizability',
    Name: 'Registryjournalizability',
    percent: 'registryjournalizabilityPercent',
    metricDomain: 'billing_invoices',
    metricLabel: 'Billing invoice registryjournalizability',
    metricDetail: 'billing invoice registryjournalizability',
    action: 'refresh_registryjournalizability_summary',
    tables: ["billing_invoices","billing_records","billing_webhook_events"],
    check1: {
      key: 'billingInvoicesTableExists',
      name: 'billing_invoice_registryjournalizability',
      label: 'Billing invoice registryjournalizability',
      table: 'billing_invoices',
    },
    check2: {
      key: 'billingRecordsTableExists',
      name: 'billing_record_registryjournalizability',
      label: 'Billing record registryjournalizability',
      table: 'billing_records',
    },
    check3Key: 'billingWebhookEventsTableExists',
    coverageKeys: {
    "billing_invoices": "billingInvoicesTableExists",
    "billing_records": "billingRecordsTableExists",
    "billing_webhook_events": "billingWebhookEventsTableExists"
    },
    readiness: 'scalingization_readiness_signal',
    readinessLabel: 'Containerization readiness signal',
    readinessDetail:
      'Billing invoices, billing records, and billing webhook events support scalingization readiness.',
    cap1: 'supportsBillingInvoiceRegistryjournalizabilitySignals',
    cap2: 'supportsBillingRecordRegistryjournalizabilitySignals',
    guidance:
      'Production registryjournalizability rollout validates billing invoice registryjournalizability, billing record registryjournalizability signals, billing webhook coverage, and scalingization readiness before production registryjournalizability tooling.',
    domains: [
      {
        domain: 'completed_runs',
        tableName: 'runs',
        requiredTables: ["runs"],
        sql: `SELECT COUNT(*)::text AS count FROM runs WHERE workspace_id = $1 AND status = 'completed'`,
      },
      {
        domain: 'failed_runs',
        tableName: 'runs',
        requiredTables: ["runs"],
        sql: `SELECT COUNT(*)::text AS count FROM runs WHERE workspace_id = $1 AND status = 'failed'`,
      },
      {
        domain: 'billing_invoices',
        tableName: 'billing_invoices',
        requiredTables: ["billing_invoices"],
        sql: `SELECT COUNT(*)::text AS count FROM billing_invoices WHERE workspace_id = $1`,
      },
      {
        domain: 'billing_records',
        tableName: 'billing_records',
        requiredTables: ["billing_records"],
        sql: `SELECT COUNT(*)::text AS count FROM billing_records WHERE workspace_id = $1`,
      },
    ],
    domainLabels: {
    "completed_runs": "Completed runs",
    "failed_runs": "Failed runs",
    "billing_invoices": "Billing invoices",
    "billing_records": "Billing records"
    },
    signalsHint: 'Run outcomes, billing invoices, and billing records',
  },
  {
    name: 'tracejournalizability',
    Name: 'Tracejournalizability',
    percent: 'tracejournalizabilityPercent',
    metricDomain: 'workspace_memberships',
    metricLabel: 'Membership tracejournalizability',
    metricDetail: 'membership tracejournalizability',
    action: 'refresh_tracejournalizability_summary',
    tables: ["workspace_memberships","usage_events","billing_notifications"],
    check1: {
      key: 'workspaceMembershipsTableExists',
      name: 'membership_tracejournalizability',
      label: 'Membership tracejournalizability',
      table: 'workspace_memberships',
    },
    check2: {
      key: 'usageEventsTableExists',
      name: 'usage_event_tracejournalizability',
      label: 'Usage event tracejournalizability',
      table: 'usage_events',
    },
    check3Key: 'billingNotificationsTableExists',
    coverageKeys: {
    "workspace_memberships": "workspaceMembershipsTableExists",
    "usage_events": "usageEventsTableExists",
    "billing_notifications": "billingNotificationsTableExists"
    },
    readiness: 'healingization_readiness_signal',
    readinessLabel: 'Sandboxization readiness signal',
    readinessDetail:
      'Workspace memberships, usage events, and billing notifications support healingization readiness.',
    cap1: 'supportsMembershipTracejournalizabilitySignals',
    cap2: 'supportsUsageEventTracejournalizabilitySignals',
    guidance:
      'Production tracejournalizability rollout validates membership tracejournalizability, usage event tracejournalizability signals, billing notification coverage, and healingization readiness before production tracejournalizability tooling.',
    domains: [
      {
        domain: 'completed_runs',
        tableName: 'runs',
        requiredTables: ["runs"],
        sql: `SELECT COUNT(*)::text AS count FROM runs WHERE workspace_id = $1 AND status = 'completed'`,
      },
      {
        domain: 'failed_runs',
        tableName: 'runs',
        requiredTables: ["runs"],
        sql: `SELECT COUNT(*)::text AS count FROM runs WHERE workspace_id = $1 AND status = 'failed'`,
      },
      {
        domain: 'workspace_memberships',
        tableName: 'workspace_memberships',
        requiredTables: ["workspace_memberships"],
        sql: `SELECT COUNT(*)::text AS count FROM workspace_memberships WHERE workspace_id = $1`,
      },
      {
        domain: 'usage_events',
        tableName: 'usage_events',
        requiredTables: ["usage_events"],
        sql: `SELECT COUNT(*)::text AS count FROM usage_events WHERE workspace_id = $1`,
      },
    ],
    domainLabels: {
    "completed_runs": "Completed runs",
    "failed_runs": "Failed runs",
    "workspace_memberships": "Workspace memberships",
    "usage_events": "Usage events"
    },
    signalsHint: 'Run outcomes, workspace memberships, and usage events',
  },
  {
    name: 'evidencejournalizability',
    Name: 'Evidencejournalizability',
    percent: 'evidencejournalizabilityPercent',
    metricDomain: 'idempotency_keys',
    metricLabel: 'Idempotency key evidencejournalizability',
    metricDetail: 'idempotency key evidencejournalizability',
    action: 'refresh_evidencejournalizability_summary',
    tables: ["idempotency_keys","usage_events","billing_webhook_events"],
    check1: {
      key: 'idempotencyKeysTableExists',
      name: 'idempotency_key_evidencejournalizability',
      label: 'Idempotency key evidencejournalizability',
      table: 'idempotency_keys',
    },
    check2: {
      key: 'usageEventsTableExists',
      name: 'usage_event_evidencejournalizability',
      label: 'Usage event evidencejournalizability',
      table: 'usage_events',
    },
    check3Key: 'billingWebhookEventsTableExists',
    coverageKeys: {
    "idempotency_keys": "idempotencyKeysTableExists",
    "usage_events": "usageEventsTableExists",
    "billing_webhook_events": "billingWebhookEventsTableExists"
    },
    readiness: 'remediationization_readiness_signal',
    readinessLabel: 'Isolatization readiness signal',
    readinessDetail:
      'Idempotency keys, usage events, and billing webhook events support remediationization readiness.',
    cap1: 'supportsIdempotencyKeyEvidencejournalizabilitySignals',
    cap2: 'supportsUsageEventEvidencejournalizabilitySignals',
    guidance:
      'Production evidencejournalizability rollout validates idempotency key evidencejournalizability, usage event evidencejournalizability signals, billing webhook coverage, and remediationization readiness before production evidencejournalizability tooling.',
    domains: [
      {
        domain: 'completed_runs',
        tableName: 'runs',
        requiredTables: ["runs"],
        sql: `SELECT COUNT(*)::text AS count FROM runs WHERE workspace_id = $1 AND status = 'completed'`,
      },
      {
        domain: 'failed_runs',
        tableName: 'runs',
        requiredTables: ["runs"],
        sql: `SELECT COUNT(*)::text AS count FROM runs WHERE workspace_id = $1 AND status = 'failed'`,
      },
      {
        domain: 'idempotency_keys',
        tableName: 'idempotency_keys',
        requiredTables: ["idempotency_keys"],
        sql: `SELECT COUNT(*)::text AS count FROM idempotency_keys WHERE workspace_id = $1`,
      },
      {
        domain: 'usage_events',
        tableName: 'usage_events',
        requiredTables: ["usage_events"],
        sql: `SELECT COUNT(*)::text AS count FROM usage_events WHERE workspace_id = $1`,
      },
    ],
    domainLabels: {
    "completed_runs": "Completed runs",
    "failed_runs": "Failed runs",
    "idempotency_keys": "Idempotency keys",
    "usage_events": "Usage events"
    },
    signalsHint: 'Run outcomes, idempotency keys, and usage events',
  },
  {
    name: 'attestjournalizability',
    Name: 'Attestjournalizability',
    percent: 'attestjournalizabilityPercent',
    metricDomain: 'shield_scans',
    metricLabel: 'Shield scan attestjournalizability',
    metricDetail: 'shield scan attestjournalizability',
    action: 'refresh_attestjournalizability_summary',
    tables: ["shield_scans","workspace_provider_credentials","billing_webhook_events"],
    check1: {
      key: 'shieldScansTableExists',
      name: 'shield_scan_attestjournalizability',
      label: 'Shield scan attestjournalizability',
      table: 'shield_scans',
    },
    check2: {
      key: 'workspaceProviderCredentialsTableExists',
      name: 'provider_credential_attestjournalizability',
      label: 'Provider credential attestjournalizability',
      table: 'workspace_provider_credentials',
    },
    check3Key: 'billingWebhookEventsTableExists',
    coverageKeys: {
    "shield_scans": "shieldScansTableExists",
    "workspace_provider_credentials": "workspaceProviderCredentialsTableExists",
    "billing_webhook_events": "billingWebhookEventsTableExists"
    },
    readiness: 'reconciliationization_readiness_signal',
    readinessLabel: 'Encapsulization readiness signal',
    readinessDetail:
      'Shield scans, workspace provider credentials, and billing webhook events support reconciliationization readiness.',
    cap1: 'supportsShieldScanAttestjournalizabilitySignals',
    cap2: 'supportsProviderCredentialAttestjournalizabilitySignals',
    guidance:
      'Production attestjournalizability rollout validates shield scan attestjournalizability, provider credential attestjournalizability signals, billing webhook coverage, and reconciliationization readiness before production attestjournalizability tooling.',
    domains: [
      {
        domain: 'completed_runs',
        tableName: 'runs',
        requiredTables: ["runs"],
        sql: `SELECT COUNT(*)::text AS count FROM runs WHERE workspace_id = $1 AND status = 'completed'`,
      },
      {
        domain: 'failed_runs',
        tableName: 'runs',
        requiredTables: ["runs"],
        sql: `SELECT COUNT(*)::text AS count FROM runs WHERE workspace_id = $1 AND status = 'failed'`,
      },
      {
        domain: 'shield_scans',
        tableName: 'shield_scans',
        requiredTables: ["shield_scans","runs"],
        sql: `SELECT COUNT(*)::text AS count FROM shield_scans ss INNER JOIN runs r ON r.run_id = ss.run_id WHERE r.workspace_id = $1`,
      },
      {
        domain: 'workspace_provider_credentials',
        tableName: 'workspace_provider_credentials',
        requiredTables: ["workspace_provider_credentials"],
        sql: `SELECT COUNT(*)::text AS count FROM workspace_provider_credentials WHERE workspace_id = $1`,
      },
    ],
    domainLabels: {
    "completed_runs": "Completed runs",
    "failed_runs": "Failed runs",
    "shield_scans": "Shield scans",
    "workspace_provider_credentials": "Provider credentials"
    },
    signalsHint: 'Run outcomes, shield scans, and provider credentials',
  },
  {
    name: 'integrityjournalizability',
    Name: 'Integrityjournalizability',
    percent: 'integrityjournalizabilityPercent',
    metricDomain: 'billing_notifications',
    metricLabel: 'Billing notification integrityjournalizability',
    metricDetail: 'billing notification integrityjournalizability',
    action: 'refresh_integrityjournalizability_summary',
    tables: ["billing_notifications","billing_webhook_events","usage_events"],
    check1: {
      key: 'billingNotificationsTableExists',
      name: 'billing_notification_integrityjournalizability',
      label: 'Billing notification integrityjournalizability',
      table: 'billing_notifications',
    },
    check2: {
      key: 'billingWebhookEventsTableExists',
      name: 'billing_webhook_integrityjournalizability',
      label: 'Billing webhook integrityjournalizability',
      table: 'billing_webhook_events',
    },
    check3Key: 'usageEventsTableExists',
    coverageKeys: {
    "billing_notifications": "billingNotificationsTableExists",
    "billing_webhook_events": "billingWebhookEventsTableExists",
    "usage_events": "usageEventsTableExists"
    },
    readiness: 'governanceization_readiness_signal',
    readinessLabel: 'Boundarization readiness signal',
    readinessDetail:
      'Billing notifications, billing webhook events, and usage events support governanceization readiness.',
    cap1: 'supportsBillingNotificationIntegrityjournalizabilitySignals',
    cap2: 'supportsBillingWebhookIntegrityjournalizabilitySignals',
    guidance:
      'Production integrityjournalizability rollout validates billing notification integrityjournalizability, billing webhook integrityjournalizability signals, usage event coverage, and governanceization readiness before production integrityjournalizability tooling.',
    domains: [
      {
        domain: 'completed_runs',
        tableName: 'runs',
        requiredTables: ["runs"],
        sql: `SELECT COUNT(*)::text AS count FROM runs WHERE workspace_id = $1 AND status = 'completed'`,
      },
      {
        domain: 'failed_runs',
        tableName: 'runs',
        requiredTables: ["runs"],
        sql: `SELECT COUNT(*)::text AS count FROM runs WHERE workspace_id = $1 AND status = 'failed'`,
      },
      {
        domain: 'billing_notifications',
        tableName: 'billing_notifications',
        requiredTables: ["billing_notifications"],
        sql: `SELECT COUNT(*)::text AS count FROM billing_notifications WHERE workspace_id = $1`,
      },
      {
        domain: 'billing_webhook_events',
        tableName: 'billing_webhook_events',
        requiredTables: ["billing_webhook_events"],
        sql: `SELECT COUNT(*)::text AS count FROM billing_webhook_events WHERE workspace_id = $1`,
      },
    ],
    domainLabels: {
    "completed_runs": "Completed runs",
    "failed_runs": "Failed runs",
    "billing_notifications": "Billing notifications",
    "billing_webhook_events": "Billing webhook events"
    },
    signalsHint: 'Run outcomes, billing notifications, and billing webhook events',
  },
]

export const patchMeta = milestones.map((m, index) => ({
  ...m,
  version: `v5.${541 + index}`,
  domainFormatter: `format${m.Name}Domain`,
}))
