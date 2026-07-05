import type {
  TopologizabilityAdminAction,
  TopologizabilityAdminRecord,
  TopologizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTopologizabilityDomainInventory = {
  domain: TopologizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTopologizabilityAdminRecords(
  inventory: WorkspaceTopologizabilityDomainInventory[],
): TopologizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTopologizabilityAdminStats(input: {
  records: TopologizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TopologizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const topologizabilityPercent =
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
    topologizabilityPercent,
  }
}

export function getTopologizabilityAdminGuidance(input: {
  stats: TopologizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect topologizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial topologizability coverage and refresh the topologizability summary.'
  }

  if (input.stats.topologizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook topologizability below the 95% target and refresh the topologizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace topologizability coverage and refresh the topologizability summary.'
}

export function resolveTopologizabilityAdminActions(): TopologizabilityAdminAction[] {
  return ['refresh_topologizability_summary']
}
