import type {
  CanonicalizabilityAdminAction,
  CanonicalizabilityAdminRecord,
  CanonicalizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCanonicalizabilityDomainInventory = {
  domain: CanonicalizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCanonicalizabilityAdminRecords(
  inventory: WorkspaceCanonicalizabilityDomainInventory[],
): CanonicalizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCanonicalizabilityAdminStats(input: {
  records: CanonicalizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CanonicalizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const canonicalizabilityPercent =
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
    canonicalizabilityPercent,
  }
}

export function getCanonicalizabilityAdminGuidance(input: {
  stats: CanonicalizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect canonicalizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial canonicalizability coverage and refresh the canonicalizability summary.'
  }

  if (input.stats.canonicalizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health canonicalizability below the 95% target and refresh the canonicalizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace canonicalizability coverage and refresh the canonicalizability summary.'
}

export function resolveCanonicalizabilityAdminActions(): CanonicalizabilityAdminAction[] {
  return ['refresh_canonicalizability_summary']
}
