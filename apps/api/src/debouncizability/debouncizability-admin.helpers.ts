import type {
  DebouncizabilityAdminAction,
  DebouncizabilityAdminRecord,
  DebouncizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDebouncizabilityDomainInventory = {
  domain: DebouncizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDebouncizabilityAdminRecords(
  inventory: WorkspaceDebouncizabilityDomainInventory[],
): DebouncizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDebouncizabilityAdminStats(input: {
  records: DebouncizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DebouncizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const debouncizabilityPercent =
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
    debouncizabilityPercent,
  }
}

export function getDebouncizabilityAdminGuidance(input: {
  stats: DebouncizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect debouncizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial debouncizability coverage and refresh the debouncizability summary.'
  }

  if (input.stats.debouncizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health debouncizability below the 95% target and refresh the debouncizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace debouncizability coverage and refresh the debouncizability summary.'
}

export function resolveDebouncizabilityAdminActions(): DebouncizabilityAdminAction[] {
  return ['refresh_debouncizability_summary']
}
