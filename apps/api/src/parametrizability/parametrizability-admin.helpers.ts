import type {
  ParametrizabilityAdminAction,
  ParametrizabilityAdminRecord,
  ParametrizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceParametrizabilityDomainInventory = {
  domain: ParametrizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildParametrizabilityAdminRecords(
  inventory: WorkspaceParametrizabilityDomainInventory[],
): ParametrizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildParametrizabilityAdminStats(input: {
  records: ParametrizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ParametrizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const parametrizabilityPercent =
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
    parametrizabilityPercent,
  }
}

export function getParametrizabilityAdminGuidance(input: {
  stats: ParametrizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect parametrizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial parametrizability coverage and refresh the parametrizability summary.'
  }

  if (input.stats.parametrizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit parametrizability below the 95% target and refresh the parametrizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace parametrizability coverage and refresh the parametrizability summary.'
}

export function resolveParametrizabilityAdminActions(): ParametrizabilityAdminAction[] {
  return ['refresh_parametrizability_summary']
}
