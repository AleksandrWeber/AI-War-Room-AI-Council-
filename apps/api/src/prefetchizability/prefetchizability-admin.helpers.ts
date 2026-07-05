import type {
  PrefetchizabilityAdminAction,
  PrefetchizabilityAdminRecord,
  PrefetchizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePrefetchizabilityDomainInventory = {
  domain: PrefetchizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPrefetchizabilityAdminRecords(
  inventory: WorkspacePrefetchizabilityDomainInventory[],
): PrefetchizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPrefetchizabilityAdminStats(input: {
  records: PrefetchizabilityAdminRecord[]
  postgresConnectivity: boolean
}): PrefetchizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const prefetchizabilityPercent =
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
    prefetchizabilityPercent,
  }
}

export function getPrefetchizabilityAdminGuidance(input: {
  stats: PrefetchizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect prefetchizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial prefetchizability coverage and refresh the prefetchizability summary.'
  }

  if (input.stats.prefetchizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential prefetchizability below the 95% target and refresh the prefetchizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace prefetchizability coverage and refresh the prefetchizability summary.'
}

export function resolvePrefetchizabilityAdminActions(): PrefetchizabilityAdminAction[] {
  return ['refresh_prefetchizability_summary']
}
