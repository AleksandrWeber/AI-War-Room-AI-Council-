import type {
  SimplicityAdminAction,
  SimplicityAdminRecord,
  SimplicityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSimplicityDomainInventory = {
  domain: SimplicityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSimplicityAdminRecords(
  inventory: WorkspaceSimplicityDomainInventory[],
): SimplicityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSimplicityAdminStats(input: {
  records: SimplicityAdminRecord[]
  postgresConnectivity: boolean
}): SimplicityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'run_workflows')
      ?.recordCount ?? 0
  const simplicityPercent =
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
    simplicityPercent,
  }
}

export function getSimplicityAdminGuidance(input: {
  stats: SimplicityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect simplicity metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial simplicity coverage and refresh the simplicity summary.'
  }

  if (input.stats.simplicityPercent < 95) {
    return 'Workspace owners and admins can inspect workflow simplicity below the 95% target and refresh the simplicity summary.'
  }

  return 'Workspace owners and admins can inspect workspace simplicity coverage and refresh the simplicity summary.'
}

export function resolveSimplicityAdminActions(): SimplicityAdminAction[] {
  return ['refresh_simplicity_summary']
}
