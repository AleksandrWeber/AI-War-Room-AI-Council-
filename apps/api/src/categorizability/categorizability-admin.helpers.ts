import type {
  CategorizabilityAdminAction,
  CategorizabilityAdminRecord,
  CategorizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCategorizabilityDomainInventory = {
  domain: CategorizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCategorizabilityAdminRecords(
  inventory: WorkspaceCategorizabilityDomainInventory[],
): CategorizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCategorizabilityAdminStats(input: {
  records: CategorizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CategorizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const categorizabilityPercent =
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
    categorizabilityPercent,
  }
}

export function getCategorizabilityAdminGuidance(input: {
  stats: CategorizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect categorizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial categorizability coverage and refresh the categorizability summary.'
  }

  if (input.stats.categorizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health categorizability below the 95% target and refresh the categorizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace categorizability coverage and refresh the categorizability summary.'
}

export function resolveCategorizabilityAdminActions(): CategorizabilityAdminAction[] {
  return ['refresh_categorizability_summary']
}
