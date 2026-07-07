import type {
  DeallocationizabilityAdminAction,
  DeallocationizabilityAdminRecord,
  DeallocationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDeallocationizabilityDomainInventory = {
  domain: DeallocationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDeallocationizabilityAdminRecords(
  inventory: WorkspaceDeallocationizabilityDomainInventory[],
): DeallocationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDeallocationizabilityAdminStats(input: {
  records: DeallocationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DeallocationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const deallocationizabilityPercent =
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
    deallocationizabilityPercent,
  }
}

export function getDeallocationizabilityAdminGuidance(input: {
  stats: DeallocationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect deallocationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial deallocationizability coverage and refresh the deallocationizability summary.'
  }

  if (input.stats.deallocationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health deallocationizability below the 95% target and refresh the deallocationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace deallocationizability coverage and refresh the deallocationizability summary.'
}

export function resolveDeallocationizabilityAdminActions(): DeallocationizabilityAdminAction[] {
  return ['refresh_deallocationizability_summary']
}
