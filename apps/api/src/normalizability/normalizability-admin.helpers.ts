import type {
  NormalizabilityAdminAction,
  NormalizabilityAdminRecord,
  NormalizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceNormalizabilityDomainInventory = {
  domain: NormalizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildNormalizabilityAdminRecords(
  inventory: WorkspaceNormalizabilityDomainInventory[],
): NormalizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildNormalizabilityAdminStats(input: {
  records: NormalizabilityAdminRecord[]
  postgresConnectivity: boolean
}): NormalizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const normalizabilityPercent =
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
    normalizabilityPercent,
  }
}

export function getNormalizabilityAdminGuidance(input: {
  stats: NormalizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect normalizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial normalizability coverage and refresh the normalizability summary.'
  }

  if (input.stats.normalizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health normalizability below the 95% target and refresh the normalizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace normalizability coverage and refresh the normalizability summary.'
}

export function resolveNormalizabilityAdminActions(): NormalizabilityAdminAction[] {
  return ['refresh_normalizability_summary']
}
