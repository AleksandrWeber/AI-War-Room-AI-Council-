import type {
  AggregatizabilityAdminAction,
  AggregatizabilityAdminRecord,
  AggregatizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAggregatizabilityDomainInventory = {
  domain: AggregatizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAggregatizabilityAdminRecords(
  inventory: WorkspaceAggregatizabilityDomainInventory[],
): AggregatizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAggregatizabilityAdminStats(input: {
  records: AggregatizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AggregatizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const aggregatizabilityPercent =
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
    aggregatizabilityPercent,
  }
}

export function getAggregatizabilityAdminGuidance(input: {
  stats: AggregatizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect aggregatizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial aggregatizability coverage and refresh the aggregatizability summary.'
  }

  if (input.stats.aggregatizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential aggregatizability below the 95% target and refresh the aggregatizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace aggregatizability coverage and refresh the aggregatizability summary.'
}

export function resolveAggregatizabilityAdminActions(): AggregatizabilityAdminAction[] {
  return ['refresh_aggregatizability_summary']
}
