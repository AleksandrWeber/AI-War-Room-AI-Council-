import type {
  ReduceizabilityAdminAction,
  ReduceizabilityAdminRecord,
  ReduceizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceReduceizabilityDomainInventory = {
  domain: ReduceizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildReduceizabilityAdminRecords(
  inventory: WorkspaceReduceizabilityDomainInventory[],
): ReduceizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildReduceizabilityAdminStats(input: {
  records: ReduceizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ReduceizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const reduceizabilityPercent =
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
    reduceizabilityPercent,
  }
}

export function getReduceizabilityAdminGuidance(input: {
  stats: ReduceizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect reduceizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial reduceizability coverage and refresh the reduceizability summary.'
  }

  if (input.stats.reduceizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit reduceizability below the 95% target and refresh the reduceizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace reduceizability coverage and refresh the reduceizability summary.'
}

export function resolveReduceizabilityAdminActions(): ReduceizabilityAdminAction[] {
  return ['refresh_reduceizability_summary']
}
