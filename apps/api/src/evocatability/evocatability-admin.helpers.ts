import type {
  EvocatabilityAdminAction,
  EvocatabilityAdminRecord,
  EvocatabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceEvocatabilityDomainInventory = {
  domain: EvocatabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildEvocatabilityAdminRecords(
  inventory: WorkspaceEvocatabilityDomainInventory[],
): EvocatabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildEvocatabilityAdminStats(input: {
  records: EvocatabilityAdminRecord[]
  postgresConnectivity: boolean
}): EvocatabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const evocatabilityPercent =
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
    evocatabilityPercent,
  }
}

export function getEvocatabilityAdminGuidance(input: {
  stats: EvocatabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect evocatability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial evocatability coverage and refresh the evocatability summary.'
  }

  if (input.stats.evocatabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health evocatability below the 95% target and refresh the evocatability summary.'
  }

  return 'Workspace owners and admins can inspect workspace evocatability coverage and refresh the evocatability summary.'
}

export function resolveEvocatabilityAdminActions(): EvocatabilityAdminAction[] {
  return ['refresh_evocatability_summary']
}
