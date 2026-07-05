import type {
  ReproducibilityAdminAction,
  ReproducibilityAdminRecord,
  ReproducibilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceReproducibilityDomainInventory = {
  domain: ReproducibilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildReproducibilityAdminRecords(
  inventory: WorkspaceReproducibilityDomainInventory[],
): ReproducibilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildReproducibilityAdminStats(input: {
  records: ReproducibilityAdminRecord[]
  postgresConnectivity: boolean
}): ReproducibilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const reproducibilityPercent =
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
    reproducibilityPercent,
  }
}

export function getReproducibilityAdminGuidance(input: {
  stats: ReproducibilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect reproducibility metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial reproducibility coverage and refresh the reproducibility summary.'
  }

  if (input.stats.reproducibilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency reproducibility below the 95% target and refresh the reproducibility summary.'
  }

  return 'Workspace owners and admins can inspect workspace reproducibility coverage and refresh the reproducibility summary.'
}

export function resolveReproducibilityAdminActions(): ReproducibilityAdminAction[] {
  return ['refresh_reproducibility_summary']
}
