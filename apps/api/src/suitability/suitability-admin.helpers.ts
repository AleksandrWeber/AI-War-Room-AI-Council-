import type {
  SuitabilityAdminAction,
  SuitabilityAdminRecord,
  SuitabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSuitabilityDomainInventory = {
  domain: SuitabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSuitabilityAdminRecords(
  inventory: WorkspaceSuitabilityDomainInventory[],
): SuitabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSuitabilityAdminStats(input: {
  records: SuitabilityAdminRecord[]
  postgresConnectivity: boolean
}): SuitabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'agent_outputs')
      ?.recordCount ?? 0
  const suitabilityPercent =
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
    suitabilityPercent,
  }
}

export function getSuitabilityAdminGuidance(input: {
  stats: SuitabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect suitability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial suitability coverage and refresh the suitability summary.'
  }

  if (input.stats.suitabilityPercent < 95) {
    return 'Workspace owners and admins can inspect agent output suitability below the 95% target and refresh the suitability summary.'
  }

  return 'Workspace owners and admins can inspect workspace suitability coverage and refresh the suitability summary.'
}

export function resolveSuitabilityAdminActions(): SuitabilityAdminAction[] {
  return ['refresh_suitability_summary']
}
