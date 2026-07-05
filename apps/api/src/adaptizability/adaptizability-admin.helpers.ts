import type {
  AdaptizabilityAdminAction,
  AdaptizabilityAdminRecord,
  AdaptizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAdaptizabilityDomainInventory = {
  domain: AdaptizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAdaptizabilityAdminRecords(
  inventory: WorkspaceAdaptizabilityDomainInventory[],
): AdaptizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAdaptizabilityAdminStats(input: {
  records: AdaptizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AdaptizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const adaptizabilityPercent =
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
    adaptizabilityPercent,
  }
}

export function getAdaptizabilityAdminGuidance(input: {
  stats: AdaptizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect adaptizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial adaptizability coverage and refresh the adaptizability summary.'
  }

  if (input.stats.adaptizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health adaptizability below the 95% target and refresh the adaptizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace adaptizability coverage and refresh the adaptizability summary.'
}

export function resolveAdaptizabilityAdminActions(): AdaptizabilityAdminAction[] {
  return ['refresh_adaptizability_summary']
}
