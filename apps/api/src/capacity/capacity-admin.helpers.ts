import type {
  CapacityAdminAction,
  CapacityAdminRecord,
  CapacityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCapacityDomainInventory = {
  domain: CapacityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCapacityAdminRecords(
  inventory: WorkspaceCapacityDomainInventory[],
): CapacityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCapacityAdminStats(input: {
  records: CapacityAdminRecord[]
  postgresConnectivity: boolean
}): CapacityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const activeRuns =
    input.records.find((record) => record.domain === 'active_runs')
      ?.recordCount ?? 0
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const failedRuns = 0
  const totalLoadRuns = activeRuns + completedRuns + failedRuns
  const loadUtilizationPercent =
    totalLoadRuns === 0
      ? 0
      : Math.round((activeRuns / totalLoadRuns) * 100)

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    loadUtilizationPercent,
  }
}

export function getCapacityAdminGuidance(input: { stats: CapacityAdminStats }) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect capacity metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial capacity coverage and refresh the capacity summary.'
  }

  if (input.stats.loadUtilizationPercent >= 80) {
    return 'Workspace owners and admins can inspect high concurrent run load above 80% utilization and refresh the capacity summary.'
  }

  return 'Workspace owners and admins can inspect workspace capacity coverage and refresh the capacity summary.'
}

export function resolveCapacityAdminActions(): CapacityAdminAction[] {
  return ['refresh_capacity_summary']
}
