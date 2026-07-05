import type {
  DispatchizabilityAdminAction,
  DispatchizabilityAdminRecord,
  DispatchizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDispatchizabilityDomainInventory = {
  domain: DispatchizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDispatchizabilityAdminRecords(
  inventory: WorkspaceDispatchizabilityDomainInventory[],
): DispatchizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDispatchizabilityAdminStats(input: {
  records: DispatchizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DispatchizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const dispatchizabilityPercent =
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
    dispatchizabilityPercent,
  }
}

export function getDispatchizabilityAdminGuidance(input: {
  stats: DispatchizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect dispatchizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial dispatchizability coverage and refresh the dispatchizability summary.'
  }

  if (input.stats.dispatchizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health dispatchizability below the 95% target and refresh the dispatchizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace dispatchizability coverage and refresh the dispatchizability summary.'
}

export function resolveDispatchizabilityAdminActions(): DispatchizabilityAdminAction[] {
  return ['refresh_dispatchizability_summary']
}
