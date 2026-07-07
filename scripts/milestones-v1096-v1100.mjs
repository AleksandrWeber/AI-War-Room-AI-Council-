export const milestones = [
  {
    name: 'programmabilityvaultizability',
    Name: 'Programmabilityvaultizability',
    percent: 'programmabilityvaultizabilityPercent',
    metricDomain: 'billing_invoices',
    metricLabel: 'Billing invoice programmabilityvaultizability',
    metricDetail: 'billing invoice programmabilityvaultizability',
    action: 'refresh_programmabilityvaultizability_summary',
    tables: ["billing_invoices","billing_records","billing_webhook_events"],
    check1: {
      key: 'billingInvoicesTableExists',
      name: 'billing_invoice_programmabilityvaultizability',
      label: 'Billing invoice programmabilityvaultizability',
      table: 'billing_invoices',
    },
    check2: {
      key: 'billingRecordsTableExists',
      name: 'billing_record_programmabilityvaultizability',
      label: 'Billing record programmabilityvaultizability',
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
    cap1: 'supportsBillingInvoiceProgrammabilityvaultizabilitySignals',
    cap2: 'supportsBillingRecordProgrammabilityvaultizabilitySignals',
    guidance:
      'Production programmabilityvaultizability rollout validates billing invoice programmabilityvaultizability, billing record programmabilityvaultizability signals, billing webhook coverage, and scalingization readiness before production programmabilityvaultizability tooling.',
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
    name: 'deployabilityvaultizability',
    Name: 'Deployabilityvaultizability',
    percent: 'deployabilityvaultizabilityPercent',
    metricDomain: 'workspace_memberships',
    metricLabel: 'Membership deployabilityvaultizability',
    metricDetail: 'membership deployabilityvaultizability',
    action: 'refresh_deployabilityvaultizability_summary',
    tables: ["workspace_memberships","usage_events","billing_notifications"],
    check1: {
      key: 'workspaceMembershipsTableExists',
      name: 'membership_deployabilityvaultizability',
      label: 'Membership deployabilityvaultizability',
      table: 'workspace_memberships',
    },
    check2: {
      key: 'usageEventsTableExists',
      name: 'usage_event_deployabilityvaultizability',
      label: 'Usage event deployabilityvaultizability',
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
    cap1: 'supportsMembershipDeployabilityvaultizabilitySignals',
    cap2: 'supportsUsageEventDeployabilityvaultizabilitySignals',
    guidance:
      'Production deployabilityvaultizability rollout validates membership deployabilityvaultizability, usage event deployabilityvaultizability signals, billing notification coverage, and healingization readiness before production deployabilityvaultizability tooling.',
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
    name: 'manageabilityvaultizability',
    Name: 'Manageabilityvaultizability',
    percent: 'manageabilityvaultizabilityPercent',
    metricDomain: 'idempotency_keys',
    metricLabel: 'Idempotency key manageabilityvaultizability',
    metricDetail: 'idempotency key manageabilityvaultizability',
    action: 'refresh_manageabilityvaultizability_summary',
    tables: ["idempotency_keys","usage_events","billing_webhook_events"],
    check1: {
      key: 'idempotencyKeysTableExists',
      name: 'idempotency_key_manageabilityvaultizability',
      label: 'Idempotency key manageabilityvaultizability',
      table: 'idempotency_keys',
    },
    check2: {
      key: 'usageEventsTableExists',
      name: 'usage_event_manageabilityvaultizability',
      label: 'Usage event manageabilityvaultizability',
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
    cap1: 'supportsIdempotencyKeyManageabilityvaultizabilitySignals',
    cap2: 'supportsUsageEventManageabilityvaultizabilitySignals',
    guidance:
      'Production manageabilityvaultizability rollout validates idempotency key manageabilityvaultizability, usage event manageabilityvaultizability signals, billing webhook coverage, and remediationization readiness before production manageabilityvaultizability tooling.',
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
    name: 'controllabilityvaultizability',
    Name: 'Controllabilityvaultizability',
    percent: 'controllabilityvaultizabilityPercent',
    metricDomain: 'shield_scans',
    metricLabel: 'Shield scan controllabilityvaultizability',
    metricDetail: 'shield scan controllabilityvaultizability',
    action: 'refresh_controllabilityvaultizability_summary',
    tables: ["shield_scans","workspace_provider_credentials","billing_webhook_events"],
    check1: {
      key: 'shieldScansTableExists',
      name: 'shield_scan_controllabilityvaultizability',
      label: 'Shield scan controllabilityvaultizability',
      table: 'shield_scans',
    },
    check2: {
      key: 'workspaceProviderCredentialsTableExists',
      name: 'provider_credential_controllabilityvaultizability',
      label: 'Provider credential controllabilityvaultizability',
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
    cap1: 'supportsShieldScanControllabilityvaultizabilitySignals',
    cap2: 'supportsProviderCredentialControllabilityvaultizabilitySignals',
    guidance:
      'Production controllabilityvaultizability rollout validates shield scan controllabilityvaultizability, provider credential controllabilityvaultizability signals, billing webhook coverage, and reconciliationization readiness before production controllabilityvaultizability tooling.',
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
    name: 'integrabilityvaultizability',
    Name: 'Integrabilityvaultizability',
    percent: 'integrabilityvaultizabilityPercent',
    metricDomain: 'billing_notifications',
    metricLabel: 'Billing notification integrabilityvaultizability',
    metricDetail: 'billing notification integrabilityvaultizability',
    action: 'refresh_integrabilityvaultizability_summary',
    tables: ["billing_notifications","billing_webhook_events","usage_events"],
    check1: {
      key: 'billingNotificationsTableExists',
      name: 'billing_notification_integrabilityvaultizability',
      label: 'Billing notification integrabilityvaultizability',
      table: 'billing_notifications',
    },
    check2: {
      key: 'billingWebhookEventsTableExists',
      name: 'billing_webhook_integrabilityvaultizability',
      label: 'Billing webhook integrabilityvaultizability',
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
    cap1: 'supportsBillingNotificationIntegrabilityvaultizabilitySignals',
    cap2: 'supportsBillingWebhookIntegrabilityvaultizabilitySignals',
    guidance:
      'Production integrabilityvaultizability rollout validates billing notification integrabilityvaultizability, billing webhook integrabilityvaultizability signals, usage event coverage, and governanceization readiness before production integrabilityvaultizability tooling.',
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
