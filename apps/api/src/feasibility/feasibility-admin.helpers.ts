import type {
  FeasibilityAdminAction,
  FeasibilityAdminRecord,
  FeasibilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceFeasibilityDomainInventory = {
  domain: FeasibilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildFeasibilityAdminRecords(
  inventory: WorkspaceFeasibilityDomainInventory[],
): FeasibilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildFeasibilityAdminStats(input: {
  records: FeasibilityAdminRecord[]
  postgresConnectivity: boolean
}): FeasibilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const feasibilityPercent =
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
    feasibilityPercent,
  }
}

export function getFeasibilityAdminGuidance(input: {
  stats: FeasibilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect feasibility metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial feasibility coverage and refresh the feasibility summary.'
  }

  if (input.stats.feasibilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential feasibility below the 95% target and refresh the feasibility summary.'
  }

  return 'Workspace owners and admins can inspect workspace feasibility coverage and refresh the feasibility summary.'
}

export function resolveFeasibilityAdminActions(): FeasibilityAdminAction[] {
  return ['refresh_feasibility_summary']
}
