import type {
  QueryizabilityAdminAction,
  QueryizabilityAdminRecord,
  QueryizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceQueryizabilityDomainInventory = {
  domain: QueryizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildQueryizabilityAdminRecords(
  inventory: WorkspaceQueryizabilityDomainInventory[],
): QueryizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildQueryizabilityAdminStats(input: {
  records: QueryizabilityAdminRecord[]
  postgresConnectivity: boolean
}): QueryizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const queryizabilityPercent =
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
    queryizabilityPercent,
  }
}

export function getQueryizabilityAdminGuidance(input: {
  stats: QueryizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect queryizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial queryizability coverage and refresh the queryizability summary.'
  }

  if (input.stats.queryizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook queryizability below the 95% target and refresh the queryizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace queryizability coverage and refresh the queryizability summary.'
}

export function resolveQueryizabilityAdminActions(): QueryizabilityAdminAction[] {
  return ['refresh_queryizability_summary']
}
