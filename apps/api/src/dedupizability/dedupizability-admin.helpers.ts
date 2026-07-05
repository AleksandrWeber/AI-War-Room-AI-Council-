import type {
  DedupizabilityAdminAction,
  DedupizabilityAdminRecord,
  DedupizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDedupizabilityDomainInventory = {
  domain: DedupizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDedupizabilityAdminRecords(
  inventory: WorkspaceDedupizabilityDomainInventory[],
): DedupizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDedupizabilityAdminStats(input: {
  records: DedupizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DedupizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const dedupizabilityPercent =
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
    dedupizabilityPercent,
  }
}

export function getDedupizabilityAdminGuidance(input: {
  stats: DedupizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect dedupizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial dedupizability coverage and refresh the dedupizability summary.'
  }

  if (input.stats.dedupizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential dedupizability below the 95% target and refresh the dedupizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace dedupizability coverage and refresh the dedupizability summary.'
}

export function resolveDedupizabilityAdminActions(): DedupizabilityAdminAction[] {
  return ['refresh_dedupizability_summary']
}
