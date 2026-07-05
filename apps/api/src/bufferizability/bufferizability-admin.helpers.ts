import type {
  BufferizabilityAdminAction,
  BufferizabilityAdminRecord,
  BufferizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceBufferizabilityDomainInventory = {
  domain: BufferizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildBufferizabilityAdminRecords(
  inventory: WorkspaceBufferizabilityDomainInventory[],
): BufferizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildBufferizabilityAdminStats(input: {
  records: BufferizabilityAdminRecord[]
  postgresConnectivity: boolean
}): BufferizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const bufferizabilityPercent =
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
    bufferizabilityPercent,
  }
}

export function getBufferizabilityAdminGuidance(input: {
  stats: BufferizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect bufferizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial bufferizability coverage and refresh the bufferizability summary.'
  }

  if (input.stats.bufferizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan bufferizability below the 95% target and refresh the bufferizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace bufferizability coverage and refresh the bufferizability summary.'
}

export function resolveBufferizabilityAdminActions(): BufferizabilityAdminAction[] {
  return ['refresh_bufferizability_summary']
}
