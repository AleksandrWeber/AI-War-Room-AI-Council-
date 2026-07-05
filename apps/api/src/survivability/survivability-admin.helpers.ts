import type {
  SurvivabilityAdminAction,
  SurvivabilityAdminRecord,
  SurvivabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSurvivabilityDomainInventory = {
  domain: SurvivabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSurvivabilityAdminRecords(
  inventory: WorkspaceSurvivabilityDomainInventory[],
): SurvivabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSurvivabilityAdminStats(input: {
  records: SurvivabilityAdminRecord[]
  postgresConnectivity: boolean
}): SurvivabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_records')
      ?.recordCount ?? 0
  const survivabilityPercent =
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
    survivabilityPercent,
  }
}

export function getSurvivabilityAdminGuidance(input: {
  stats: SurvivabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect survivability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial survivability coverage and refresh the survivability summary.'
  }

  if (input.stats.survivabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing record survivability below the 95% target and refresh the survivability summary.'
  }

  return 'Workspace owners and admins can inspect workspace survivability coverage and refresh the survivability summary.'
}

export function resolveSurvivabilityAdminActions(): SurvivabilityAdminAction[] {
  return ['refresh_survivability_summary']
}
