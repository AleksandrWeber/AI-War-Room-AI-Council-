import type {
  InvalidationizabilityAdminAction,
  InvalidationizabilityAdminRecord,
  InvalidationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceInvalidationizabilityDomainInventory = {
  domain: InvalidationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildInvalidationizabilityAdminRecords(
  inventory: WorkspaceInvalidationizabilityDomainInventory[],
): InvalidationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildInvalidationizabilityAdminStats(input: {
  records: InvalidationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): InvalidationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const invalidationizabilityPercent =
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
    invalidationizabilityPercent,
  }
}

export function getInvalidationizabilityAdminGuidance(input: {
  stats: InvalidationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect invalidationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial invalidationizability coverage and refresh the invalidationizability summary.'
  }

  if (input.stats.invalidationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key invalidationizability below the 95% target and refresh the invalidationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace invalidationizability coverage and refresh the invalidationizability summary.'
}

export function resolveInvalidationizabilityAdminActions(): InvalidationizabilityAdminAction[] {
  return ['refresh_invalidationizability_summary']
}
