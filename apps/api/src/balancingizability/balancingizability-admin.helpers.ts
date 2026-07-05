import type {
  BalancingizabilityAdminAction,
  BalancingizabilityAdminRecord,
  BalancingizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceBalancingizabilityDomainInventory = {
  domain: BalancingizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildBalancingizabilityAdminRecords(
  inventory: WorkspaceBalancingizabilityDomainInventory[],
): BalancingizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildBalancingizabilityAdminStats(input: {
  records: BalancingizabilityAdminRecord[]
  postgresConnectivity: boolean
}): BalancingizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const balancingizabilityPercent =
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
    balancingizabilityPercent,
  }
}

export function getBalancingizabilityAdminGuidance(input: {
  stats: BalancingizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect balancingizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial balancingizability coverage and refresh the balancingizability summary.'
  }

  if (input.stats.balancingizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health balancingizability below the 95% target and refresh the balancingizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace balancingizability coverage and refresh the balancingizability summary.'
}

export function resolveBalancingizabilityAdminActions(): BalancingizabilityAdminAction[] {
  return ['refresh_balancingizability_summary']
}
