import type {
  ClassifiabilityAdminAction,
  ClassifiabilityAdminRecord,
  ClassifiabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceClassifiabilityDomainInventory = {
  domain: ClassifiabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildClassifiabilityAdminRecords(
  inventory: WorkspaceClassifiabilityDomainInventory[],
): ClassifiabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildClassifiabilityAdminStats(input: {
  records: ClassifiabilityAdminRecord[]
  postgresConnectivity: boolean
}): ClassifiabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const classifiabilityPercent =
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
    classifiabilityPercent,
  }
}

export function getClassifiabilityAdminGuidance(input: {
  stats: ClassifiabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect classifiability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial classifiability coverage and refresh the classifiability summary.'
  }

  if (input.stats.classifiabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key classifiability below the 95% target and refresh the classifiability summary.'
  }

  return 'Workspace owners and admins can inspect workspace classifiability coverage and refresh the classifiability summary.'
}

export function resolveClassifiabilityAdminActions(): ClassifiabilityAdminAction[] {
  return ['refresh_classifiability_summary']
}
