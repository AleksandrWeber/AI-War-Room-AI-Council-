import type {
  ConsistencyAdminAction,
  ConsistencyAdminRecord,
  ConsistencyAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceConsistencyDomainInventory = {
  domain: ConsistencyAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildConsistencyAdminRecords(
  inventory: WorkspaceConsistencyDomainInventory[],
): ConsistencyAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildConsistencyAdminStats(input: {
  records: ConsistencyAdminRecord[]
  postgresConnectivity: boolean
}): ConsistencyAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const failedRuns =
    input.records.find((record) => record.domain === 'failed_runs')
      ?.recordCount ?? 0
  const totalOutcomeRuns = completedRuns + failedRuns
  const consistencyPercent =
    totalOutcomeRuns === 0
      ? 100
      : Math.round((completedRuns / totalOutcomeRuns) * 100)

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    consistencyPercent,
  }
}

export function getConsistencyAdminGuidance(input: {
  stats: ConsistencyAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect consistency metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial consistency coverage and refresh the consistency summary.'
  }

  if (input.stats.consistencyPercent < 95) {
    return 'Workspace owners and admins can inspect run consistency below the 95% target and refresh the consistency summary.'
  }

  return 'Workspace owners and admins can inspect workspace consistency coverage and refresh the consistency summary.'
}

export function resolveConsistencyAdminActions(): ConsistencyAdminAction[] {
  return ['refresh_consistency_summary']
}
