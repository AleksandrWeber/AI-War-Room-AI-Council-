import type {
  DeadletterizabilityAdminAction,
  DeadletterizabilityAdminRecord,
  DeadletterizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDeadletterizabilityDomainInventory = {
  domain: DeadletterizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDeadletterizabilityAdminRecords(
  inventory: WorkspaceDeadletterizabilityDomainInventory[],
): DeadletterizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDeadletterizabilityAdminStats(input: {
  records: DeadletterizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DeadletterizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const deadletterizabilityPercent =
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
    deadletterizabilityPercent,
  }
}

export function getDeadletterizabilityAdminGuidance(input: {
  stats: DeadletterizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect deadletterizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial deadletterizability coverage and refresh the deadletterizability summary.'
  }

  if (input.stats.deadletterizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit deadletterizability below the 95% target and refresh the deadletterizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace deadletterizability coverage and refresh the deadletterizability summary.'
}

export function resolveDeadletterizabilityAdminActions(): DeadletterizabilityAdminAction[] {
  return ['refresh_deadletterizability_summary']
}
