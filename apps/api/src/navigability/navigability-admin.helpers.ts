import type {
  NavigabilityAdminAction,
  NavigabilityAdminRecord,
  NavigabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceNavigabilityDomainInventory = {
  domain: NavigabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildNavigabilityAdminRecords(
  inventory: WorkspaceNavigabilityDomainInventory[],
): NavigabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildNavigabilityAdminStats(input: {
  records: NavigabilityAdminRecord[]
  postgresConnectivity: boolean
}): NavigabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'run_workflows')
      ?.recordCount ?? 0
  const navigabilityPercent =
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
    navigabilityPercent,
  }
}

export function getNavigabilityAdminGuidance(input: {
  stats: NavigabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect navigability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial navigability coverage and refresh the navigability summary.'
  }

  if (input.stats.navigabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workflow navigability below the 95% target and refresh the navigability summary.'
  }

  return 'Workspace owners and admins can inspect workspace navigability coverage and refresh the navigability summary.'
}

export function resolveNavigabilityAdminActions(): NavigabilityAdminAction[] {
  return ['refresh_navigability_summary']
}
