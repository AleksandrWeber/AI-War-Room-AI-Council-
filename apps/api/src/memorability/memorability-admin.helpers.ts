import type {
  MemorabilityAdminAction,
  MemorabilityAdminRecord,
  MemorabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMemorabilityDomainInventory = {
  domain: MemorabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMemorabilityAdminRecords(
  inventory: WorkspaceMemorabilityDomainInventory[],
): MemorabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMemorabilityAdminStats(input: {
  records: MemorabilityAdminRecord[]
  postgresConnectivity: boolean
}): MemorabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'artifacts')
      ?.recordCount ?? 0
  const memorabilityPercent =
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
    memorabilityPercent,
  }
}

export function getMemorabilityAdminGuidance(input: {
  stats: MemorabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect memorability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial memorability coverage and refresh the memorability summary.'
  }

  if (input.stats.memorabilityPercent < 95) {
    return 'Workspace owners and admins can inspect artifact memorability below the 95% target and refresh the memorability summary.'
  }

  return 'Workspace owners and admins can inspect workspace memorability coverage and refresh the memorability summary.'
}

export function resolveMemorabilityAdminActions(): MemorabilityAdminAction[] {
  return ['refresh_memorability_summary']
}
