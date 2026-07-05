import type {
  RebalanceizabilityAdminAction,
  RebalanceizabilityAdminRecord,
  RebalanceizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRebalanceizabilityDomainInventory = {
  domain: RebalanceizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRebalanceizabilityAdminRecords(
  inventory: WorkspaceRebalanceizabilityDomainInventory[],
): RebalanceizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRebalanceizabilityAdminStats(input: {
  records: RebalanceizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RebalanceizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const rebalanceizabilityPercent =
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
    rebalanceizabilityPercent,
  }
}

export function getRebalanceizabilityAdminGuidance(input: {
  stats: RebalanceizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect rebalanceizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial rebalanceizability coverage and refresh the rebalanceizability summary.'
  }

  if (input.stats.rebalanceizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage rebalanceizability below the 95% target and refresh the rebalanceizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace rebalanceizability coverage and refresh the rebalanceizability summary.'
}

export function resolveRebalanceizabilityAdminActions(): RebalanceizabilityAdminAction[] {
  return ['refresh_rebalanceizability_summary']
}
