import type {
  CompatibilityAdminAction,
  CompatibilityAdminRecord,
  CompatibilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCompatibilityDomainInventory = {
  domain: CompatibilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCompatibilityAdminRecords(
  inventory: WorkspaceCompatibilityDomainInventory[],
): CompatibilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCompatibilityAdminStats(input: {
  records: CompatibilityAdminRecord[]
  postgresConnectivity: boolean
}): CompatibilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const compatibilityPercent =
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
    compatibilityPercent,
  }
}

export function getCompatibilityAdminGuidance(input: {
  stats: CompatibilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect compatibility metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial compatibility coverage and refresh the compatibility summary.'
  }

  if (input.stats.compatibilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential compatibility below the 95% target and refresh the compatibility summary.'
  }

  return 'Workspace owners and admins can inspect workspace compatibility coverage and refresh the compatibility summary.'
}

export function resolveCompatibilityAdminActions(): CompatibilityAdminAction[] {
  return ['refresh_compatibility_summary']
}
