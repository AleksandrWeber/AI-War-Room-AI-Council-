import type {
  AbductizabilityAdminAction,
  AbductizabilityAdminRecord,
  AbductizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAbductizabilityDomainInventory = {
  domain: AbductizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAbductizabilityAdminRecords(
  inventory: WorkspaceAbductizabilityDomainInventory[],
): AbductizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAbductizabilityAdminStats(input: {
  records: AbductizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AbductizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const abductizabilityPercent =
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
    abductizabilityPercent,
  }
}

export function getAbductizabilityAdminGuidance(input: {
  stats: AbductizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect abductizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial abductizability coverage and refresh the abductizability summary.'
  }

  if (input.stats.abductizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key abductizability below the 95% target and refresh the abductizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace abductizability coverage and refresh the abductizability summary.'
}

export function resolveAbductizabilityAdminActions(): AbductizabilityAdminAction[] {
  return ['refresh_abductizability_summary']
}
