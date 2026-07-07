export const milestones = [
  {
    name: 'repeatabilityvaultizability',
    Name: 'Repeatabilityvaultizability',
    percent: 'repeatabilityvaultizabilityPercent',
    metricDomain: 'billing_invoices',
    metricLabel: 'Billing invoice repeatabilityvaultizability',
    metricDetail: 'billing invoice repeatabilityvaultizability',
    action: 'refresh_repeatabilityvaultizability_summary',
    tables: ["billing_invoices","billing_records","billing_webhook_events"],
    check1: {
      key: 'billingInvoicesTableExists',
      name: 'billing_invoice_repeatabilityvaultizability',
      label: 'Billing invoice repeatabilityvaultizability',
      table: 'billing_invoices',
    },
    check2: {
      key: 'billingRecordsTableExists',
      name: 'billing_record_repeatabilityvaultizability',
      label: 'Billing record repeatabilityvaultizability',
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
    cap1: 'supportsBillingInvoiceRepeatabilityvaultizabilitySignals',
    cap2: 'supportsBillingRecordRepeatabilityvaultizabilitySignals',
    guidance:
      'Production repeatabilityvaultizability rollout validates billing invoice repeatabilityvaultizability, billing record repeatabilityvaultizability signals, billing webhook coverage, and scalingization readiness before production repeatabilityvaultizability tooling.',
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
    name: 'responsivenessvaultizability',
    Name: 'Responsivenessvaultizability',
    percent: 'responsivenessvaultizabilityPercent',
    metricDomain: 'workspace_memberships',
    metricLabel: 'Membership responsivenessvaultizability',
    metricDetail: 'membership responsivenessvaultizability',
    action: 'refresh_responsivenessvaultizability_summary',
    tables: ["workspace_memberships","usage_events","billing_notifications"],
    check1: {
      key: 'workspaceMembershipsTableExists',
      name: 'membership_responsivenessvaultizability',
      label: 'Membership responsivenessvaultizability',
      table: 'workspace_memberships',
    },
    check2: {
      key: 'usageEventsTableExists',
      name: 'usage_event_responsivenessvaultizability',
      label: 'Usage event responsivenessvaultizability',
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
    cap1: 'supportsMembershipResponsivenessvaultizabilitySignals',
    cap2: 'supportsUsageEventResponsivenessvaultizabilitySignals',
    guidance:
      'Production responsivenessvaultizability rollout validates membership responsivenessvaultizability, usage event responsivenessvaultizability signals, billing notification coverage, and healingization readiness before production responsivenessvaultizability tooling.',
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
    name: 'dependabilityvaultizability',
    Name: 'Dependabilityvaultizability',
    percent: 'dependabilityvaultizabilityPercent',
    metricDomain: 'idempotency_keys',
    metricLabel: 'Idempotency key dependabilityvaultizability',
    metricDetail: 'idempotency key dependabilityvaultizability',
    action: 'refresh_dependabilityvaultizability_summary',
    tables: ["idempotency_keys","usage_events","billing_webhook_events"],
    check1: {
      key: 'idempotencyKeysTableExists',
      name: 'idempotency_key_dependabilityvaultizability',
      label: 'Idempotency key dependabilityvaultizability',
      table: 'idempotency_keys',
    },
    check2: {
      key: 'usageEventsTableExists',
      name: 'usage_event_dependabilityvaultizability',
      label: 'Usage event dependabilityvaultizability',
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
    cap1: 'supportsIdempotencyKeyDependabilityvaultizabilitySignals',
    cap2: 'supportsUsageEventDependabilityvaultizabilitySignals',
    guidance:
      'Production dependabilityvaultizability rollout validates idempotency key dependabilityvaultizability, usage event dependabilityvaultizability signals, billing webhook coverage, and remediationization readiness before production dependabilityvaultizability tooling.',
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
    name: 'composabilityvaultizability',
    Name: 'Composabilityvaultizability',
    percent: 'composabilityvaultizabilityPercent',
    metricDomain: 'shield_scans',
    metricLabel: 'Shield scan composabilityvaultizability',
    metricDetail: 'shield scan composabilityvaultizability',
    action: 'refresh_composabilityvaultizability_summary',
    tables: ["shield_scans","workspace_provider_credentials","billing_webhook_events"],
    check1: {
      key: 'shieldScansTableExists',
      name: 'shield_scan_composabilityvaultizability',
      label: 'Shield scan composabilityvaultizability',
      table: 'shield_scans',
    },
    check2: {
      key: 'workspaceProviderCredentialsTableExists',
      name: 'provider_credential_composabilityvaultizability',
      label: 'Provider credential composabilityvaultizability',
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
    cap1: 'supportsShieldScanComposabilityvaultizabilitySignals',
    cap2: 'supportsProviderCredentialComposabilityvaultizabilitySignals',
    guidance:
      'Production composabilityvaultizability rollout validates shield scan composabilityvaultizability, provider credential composabilityvaultizability signals, billing webhook coverage, and reconciliationization readiness before production composabilityvaultizability tooling.',
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
    name: 'trustworthinessvaultizability',
    Name: 'Trustworthinessvaultizability',
    percent: 'trustworthinessvaultizabilityPercent',
    metricDomain: 'billing_notifications',
    metricLabel: 'Billing notification trustworthinessvaultizability',
    metricDetail: 'billing notification trustworthinessvaultizability',
    action: 'refresh_trustworthinessvaultizability_summary',
    tables: ["billing_notifications","billing_webhook_events","usage_events"],
    check1: {
      key: 'billingNotificationsTableExists',
      name: 'billing_notification_trustworthinessvaultizability',
      label: 'Billing notification trustworthinessvaultizability',
      table: 'billing_notifications',
    },
    check2: {
      key: 'billingWebhookEventsTableExists',
      name: 'billing_webhook_trustworthinessvaultizability',
      label: 'Billing webhook trustworthinessvaultizability',
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
    cap1: 'supportsBillingNotificationTrustworthinessvaultizabilitySignals',
    cap2: 'supportsBillingWebhookTrustworthinessvaultizabilitySignals',
    guidance:
      'Production trustworthinessvaultizability rollout validates billing notification trustworthinessvaultizability, billing webhook trustworthinessvaultizability signals, usage event coverage, and governanceization readiness before production trustworthinessvaultizability tooling.',
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
  version: `v5.${576 + index}`,
  domainFormatter: `format${m.Name}Domain`,
}))
