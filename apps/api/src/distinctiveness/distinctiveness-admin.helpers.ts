import type {
  DistinctivenessAdminAction,
  DistinctivenessAdminRecord,
  DistinctivenessAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDistinctivenessDomainInventory = {
  domain: DistinctivenessAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDistinctivenessAdminRecords(
  inventory: WorkspaceDistinctivenessDomainInventory[],
): DistinctivenessAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDistinctivenessAdminStats(input: {
  records: DistinctivenessAdminRecord[]
  postgresConnectivity: boolean
}): DistinctivenessAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const distinctivenessPercent =
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
    distinctivenessPercent,
  }
}

export function getDistinctivenessAdminGuidance(input: {
  stats: DistinctivenessAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect distinctiveness metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial distinctiveness coverage and refresh the distinctiveness summary.'
  }

  if (input.stats.distinctivenessPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key distinctiveness below the 95% target and refresh the distinctiveness summary.'
  }

  return 'Workspace owners and admins can inspect workspace distinctiveness coverage and refresh the distinctiveness summary.'
}

export function resolveDistinctivenessAdminActions(): DistinctivenessAdminAction[] {
  return ['refresh_distinctiveness_summary']
}
