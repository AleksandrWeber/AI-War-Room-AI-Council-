import type {
  UtilizationAdminAction,
  UtilizationAdminRecord,
  UtilizationAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceUtilizationDomainInventory = {
  domain: UtilizationAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildUtilizationAdminRecords(
  inventory: WorkspaceUtilizationDomainInventory[],
): UtilizationAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildUtilizationAdminStats(input: {
  records: UtilizationAdminRecord[]
  postgresConnectivity: boolean
}): UtilizationAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const activeRuns =
    input.records.find((record) => record.domain === 'active_runs')
      ?.recordCount ?? 0
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const memberships =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const totalRunSignals = activeRuns + completedRuns
  const utilizationPercent =
    memberships === 0
      ? totalRunSignals === 0
        ? 0
        : 100
      : Math.min(100, Math.round((totalRunSignals / memberships) * 100))

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    utilizationPercent,
  }
}

export function getUtilizationAdminGuidance(input: {
  stats: UtilizationAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect utilization metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial utilization coverage and refresh the utilization summary.'
  }

  if (input.stats.utilizationPercent >= 80) {
    return 'Workspace owners and admins can inspect high workspace utilization above 80% and refresh the utilization summary.'
  }

  return 'Workspace owners and admins can inspect workspace utilization coverage and refresh the utilization summary.'
}

export function resolveUtilizationAdminActions(): UtilizationAdminAction[] {
  return ['refresh_utilization_summary']
}
