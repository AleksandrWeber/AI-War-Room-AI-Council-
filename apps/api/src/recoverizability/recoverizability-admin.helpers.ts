import type {
  RecoverizabilityAdminAction,
  RecoverizabilityAdminRecord,
  RecoverizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRecoverizabilityDomainInventory = {
  domain: RecoverizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRecoverizabilityAdminRecords(
  inventory: WorkspaceRecoverizabilityDomainInventory[],
): RecoverizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRecoverizabilityAdminStats(input: {
  records: RecoverizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RecoverizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const recoverizabilityPercent =
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
    recoverizabilityPercent,
  }
}

export function getRecoverizabilityAdminGuidance(input: {
  stats: RecoverizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect recoverizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial recoverizability coverage and refresh the recoverizability summary.'
  }

  if (input.stats.recoverizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook recoverizability below the 95% target and refresh the recoverizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace recoverizability coverage and refresh the recoverizability summary.'
}

export function resolveRecoverizabilityAdminActions(): RecoverizabilityAdminAction[] {
  return ['refresh_recoverizability_summary']
}
