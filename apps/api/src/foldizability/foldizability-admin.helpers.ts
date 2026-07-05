import type {
  FoldizabilityAdminAction,
  FoldizabilityAdminRecord,
  FoldizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceFoldizabilityDomainInventory = {
  domain: FoldizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildFoldizabilityAdminRecords(
  inventory: WorkspaceFoldizabilityDomainInventory[],
): FoldizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildFoldizabilityAdminStats(input: {
  records: FoldizabilityAdminRecord[]
  postgresConnectivity: boolean
}): FoldizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const foldizabilityPercent =
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
    foldizabilityPercent,
  }
}

export function getFoldizabilityAdminGuidance(input: {
  stats: FoldizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect foldizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial foldizability coverage and refresh the foldizability summary.'
  }

  if (input.stats.foldizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential foldizability below the 95% target and refresh the foldizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace foldizability coverage and refresh the foldizability summary.'
}

export function resolveFoldizabilityAdminActions(): FoldizabilityAdminAction[] {
  return ['refresh_foldizability_summary']
}
