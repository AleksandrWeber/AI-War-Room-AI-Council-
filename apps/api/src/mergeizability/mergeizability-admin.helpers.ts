import type {
  MergeizabilityAdminAction,
  MergeizabilityAdminRecord,
  MergeizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMergeizabilityDomainInventory = {
  domain: MergeizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMergeizabilityAdminRecords(
  inventory: WorkspaceMergeizabilityDomainInventory[],
): MergeizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMergeizabilityAdminStats(input: {
  records: MergeizabilityAdminRecord[]
  postgresConnectivity: boolean
}): MergeizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const mergeizabilityPercent =
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
    mergeizabilityPercent,
  }
}

export function getMergeizabilityAdminGuidance(input: {
  stats: MergeizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect mergeizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial mergeizability coverage and refresh the mergeizability summary.'
  }

  if (input.stats.mergeizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership mergeizability below the 95% target and refresh the mergeizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace mergeizability coverage and refresh the mergeizability summary.'
}

export function resolveMergeizabilityAdminActions(): MergeizabilityAdminAction[] {
  return ['refresh_mergeizability_summary']
}
