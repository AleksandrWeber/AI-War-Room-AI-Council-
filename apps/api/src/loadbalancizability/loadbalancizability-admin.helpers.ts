import type {
  LoadbalancizabilityAdminAction,
  LoadbalancizabilityAdminRecord,
  LoadbalancizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceLoadbalancizabilityDomainInventory = {
  domain: LoadbalancizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildLoadbalancizabilityAdminRecords(
  inventory: WorkspaceLoadbalancizabilityDomainInventory[],
): LoadbalancizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildLoadbalancizabilityAdminStats(input: {
  records: LoadbalancizabilityAdminRecord[]
  postgresConnectivity: boolean
}): LoadbalancizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const loadbalancizabilityPercent =
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
    loadbalancizabilityPercent,
  }
}

export function getLoadbalancizabilityAdminGuidance(input: {
  stats: LoadbalancizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect loadbalancizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial loadbalancizability coverage and refresh the loadbalancizability summary.'
  }

  if (input.stats.loadbalancizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit loadbalancizability below the 95% target and refresh the loadbalancizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace loadbalancizability coverage and refresh the loadbalancizability summary.'
}

export function resolveLoadbalancizabilityAdminActions(): LoadbalancizabilityAdminAction[] {
  return ['refresh_loadbalancizability_summary']
}
