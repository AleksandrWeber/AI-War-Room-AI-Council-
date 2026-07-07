import type {
  PrivacyizabilityAdminAction,
  PrivacyizabilityAdminRecord,
  PrivacyizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePrivacyizabilityDomainInventory = {
  domain: PrivacyizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPrivacyizabilityAdminRecords(
  inventory: WorkspacePrivacyizabilityDomainInventory[],
): PrivacyizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPrivacyizabilityAdminStats(input: {
  records: PrivacyizabilityAdminRecord[]
  postgresConnectivity: boolean
}): PrivacyizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const privacyizabilityPercent =
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
    privacyizabilityPercent,
  }
}

export function getPrivacyizabilityAdminGuidance(input: {
  stats: PrivacyizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect privacyizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial privacyizability coverage and refresh the privacyizability summary.'
  }

  if (input.stats.privacyizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key privacyizability below the 95% target and refresh the privacyizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace privacyizability coverage and refresh the privacyizability summary.'
}

export function resolvePrivacyizabilityAdminActions(): PrivacyizabilityAdminAction[] {
  return ['refresh_privacyizability_summary']
}
