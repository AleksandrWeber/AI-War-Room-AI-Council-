import type {
  ParsabilityAdminAction,
  ParsabilityAdminRecord,
  ParsabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceParsabilityDomainInventory = {
  domain: ParsabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildParsabilityAdminRecords(
  inventory: WorkspaceParsabilityDomainInventory[],
): ParsabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildParsabilityAdminStats(input: {
  records: ParsabilityAdminRecord[]
  postgresConnectivity: boolean
}): ParsabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const parsabilityPercent =
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
    parsabilityPercent,
  }
}

export function getParsabilityAdminGuidance(input: {
  stats: ParsabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect parsability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial parsability coverage and refresh the parsability summary.'
  }

  if (input.stats.parsabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key parsability below the 95% target and refresh the parsability summary.'
  }

  return 'Workspace owners and admins can inspect workspace parsability coverage and refresh the parsability summary.'
}

export function resolveParsabilityAdminActions(): ParsabilityAdminAction[] {
  return ['refresh_parsability_summary']
}
