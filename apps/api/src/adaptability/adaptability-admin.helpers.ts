import type {
  AdaptabilityAdminAction,
  AdaptabilityAdminRecord,
  AdaptabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAdaptabilityDomainInventory = {
  domain: AdaptabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAdaptabilityAdminRecords(
  inventory: WorkspaceAdaptabilityDomainInventory[],
): AdaptabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAdaptabilityAdminStats(input: {
  records: AdaptabilityAdminRecord[]
  postgresConnectivity: boolean
}): AdaptabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const adaptabilityPercent =
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
    adaptabilityPercent,
  }
}

export function getAdaptabilityAdminGuidance(input: {
  stats: AdaptabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect adaptability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial adaptability coverage and refresh the adaptability summary.'
  }

  if (input.stats.adaptabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook adaptability below the 95% target and refresh the adaptability summary.'
  }

  return 'Workspace owners and admins can inspect workspace adaptability coverage and refresh the adaptability summary.'
}

export function resolveAdaptabilityAdminActions(): AdaptabilityAdminAction[] {
  return ['refresh_adaptability_summary']
}
