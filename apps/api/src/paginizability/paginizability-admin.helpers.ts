import type {
  PaginizabilityAdminAction,
  PaginizabilityAdminRecord,
  PaginizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePaginizabilityDomainInventory = {
  domain: PaginizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPaginizabilityAdminRecords(
  inventory: WorkspacePaginizabilityDomainInventory[],
): PaginizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPaginizabilityAdminStats(input: {
  records: PaginizabilityAdminRecord[]
  postgresConnectivity: boolean
}): PaginizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const paginizabilityPercent =
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
    paginizabilityPercent,
  }
}

export function getPaginizabilityAdminGuidance(input: {
  stats: PaginizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect paginizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial paginizability coverage and refresh the paginizability summary.'
  }

  if (input.stats.paginizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential paginizability below the 95% target and refresh the paginizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace paginizability coverage and refresh the paginizability summary.'
}

export function resolvePaginizabilityAdminActions(): PaginizabilityAdminAction[] {
  return ['refresh_paginizability_summary']
}
