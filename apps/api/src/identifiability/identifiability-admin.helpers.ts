import type {
  IdentifiabilityAdminAction,
  IdentifiabilityAdminRecord,
  IdentifiabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceIdentifiabilityDomainInventory = {
  domain: IdentifiabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildIdentifiabilityAdminRecords(
  inventory: WorkspaceIdentifiabilityDomainInventory[],
): IdentifiabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildIdentifiabilityAdminStats(input: {
  records: IdentifiabilityAdminRecord[]
  postgresConnectivity: boolean
}): IdentifiabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const identifiabilityPercent =
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
    identifiabilityPercent,
  }
}

export function getIdentifiabilityAdminGuidance(input: {
  stats: IdentifiabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect identifiability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial identifiability coverage and refresh the identifiability summary.'
  }

  if (input.stats.identifiabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key identifiability below the 95% target and refresh the identifiability summary.'
  }

  return 'Workspace owners and admins can inspect workspace identifiability coverage and refresh the identifiability summary.'
}

export function resolveIdentifiabilityAdminActions(): IdentifiabilityAdminAction[] {
  return ['refresh_identifiability_summary']
}
