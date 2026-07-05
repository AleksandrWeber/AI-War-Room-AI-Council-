import type {
  MemorizabilityAdminAction,
  MemorizabilityAdminRecord,
  MemorizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMemorizabilityDomainInventory = {
  domain: MemorizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMemorizabilityAdminRecords(
  inventory: WorkspaceMemorizabilityDomainInventory[],
): MemorizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMemorizabilityAdminStats(input: {
  records: MemorizabilityAdminRecord[]
  postgresConnectivity: boolean
}): MemorizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const memorizabilityPercent =
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
    memorizabilityPercent,
  }
}

export function getMemorizabilityAdminGuidance(input: {
  stats: MemorizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect memorizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial memorizability coverage and refresh the memorizability summary.'
  }

  if (input.stats.memorizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan memorizability below the 95% target and refresh the memorizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace memorizability coverage and refresh the memorizability summary.'
}

export function resolveMemorizabilityAdminActions(): MemorizabilityAdminAction[] {
  return ['refresh_memorizability_summary']
}
