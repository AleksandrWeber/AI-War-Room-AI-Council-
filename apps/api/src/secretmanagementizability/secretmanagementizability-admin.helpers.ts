import type {
  SecretmanagementizabilityAdminAction,
  SecretmanagementizabilityAdminRecord,
  SecretmanagementizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSecretmanagementizabilityDomainInventory = {
  domain: SecretmanagementizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSecretmanagementizabilityAdminRecords(
  inventory: WorkspaceSecretmanagementizabilityDomainInventory[],
): SecretmanagementizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSecretmanagementizabilityAdminStats(input: {
  records: SecretmanagementizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SecretmanagementizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const secretmanagementizabilityPercent =
    completedRuns === 0
      ? 100
      : Math.min(100, Math.round((metricRecords / completedRuns) * 100))

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    secretmanagementizabilityPercent,
  }
}

export function getSecretmanagementizabilityAdminGuidance(input: {
  stats: SecretmanagementizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect secretmanagementizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial secretmanagementizability coverage and refresh the secretmanagementizability summary.'
  }

  if (input.stats.secretmanagementizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key secretmanagementizability below the 95% target and refresh the secretmanagementizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace secretmanagementizability coverage and refresh the secretmanagementizability summary.'
}

export function resolveSecretmanagementizabilityAdminActions(): SecretmanagementizabilityAdminAction[] {
  return ['refresh_secretmanagementizability_summary']
}
