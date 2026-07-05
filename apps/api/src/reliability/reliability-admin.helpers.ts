import type {
  ReliabilityAdminAction,
  ReliabilityAdminRecord,
  ReliabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceReliabilityDomainInventory = {
  domain: ReliabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildReliabilityAdminRecords(
  inventory: WorkspaceReliabilityDomainInventory[],
): ReliabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildReliabilityAdminStats(input: {
  records: ReliabilityAdminRecord[]
  postgresConnectivity: boolean
}): ReliabilityAdminStats {
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
  const reliabilityPercent =
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
    reliabilityPercent,
  }
}

export function getReliabilityAdminGuidance(input: {
  stats: ReliabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect reliability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial reliability coverage and refresh the reliability summary.'
  }

  if (input.stats.reliabilityPercent < 95) {
    return 'Workspace owners and admins can inspect run reliability below the 95% target and refresh the reliability summary.'
  }

  return 'Workspace owners and admins can inspect workspace reliability coverage and refresh the reliability summary.'
}

export function resolveReliabilityAdminActions(): ReliabilityAdminAction[] {
  return ['refresh_reliability_summary']
}
