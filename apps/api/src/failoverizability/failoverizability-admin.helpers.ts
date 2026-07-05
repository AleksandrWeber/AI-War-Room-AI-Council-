import type {
  FailoverizabilityAdminAction,
  FailoverizabilityAdminRecord,
  FailoverizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceFailoverizabilityDomainInventory = {
  domain: FailoverizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildFailoverizabilityAdminRecords(
  inventory: WorkspaceFailoverizabilityDomainInventory[],
): FailoverizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildFailoverizabilityAdminStats(input: {
  records: FailoverizabilityAdminRecord[]
  postgresConnectivity: boolean
}): FailoverizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const failoverizabilityPercent =
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
    failoverizabilityPercent,
  }
}

export function getFailoverizabilityAdminGuidance(input: {
  stats: FailoverizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect failoverizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial failoverizability coverage and refresh the failoverizability summary.'
  }

  if (input.stats.failoverizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit failoverizability below the 95% target and refresh the failoverizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace failoverizability coverage and refresh the failoverizability summary.'
}

export function resolveFailoverizabilityAdminActions(): FailoverizabilityAdminAction[] {
  return ['refresh_failoverizability_summary']
}
