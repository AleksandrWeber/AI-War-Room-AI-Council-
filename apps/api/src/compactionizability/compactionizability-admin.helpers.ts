import type {
  CompactionizabilityAdminAction,
  CompactionizabilityAdminRecord,
  CompactionizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCompactionizabilityDomainInventory = {
  domain: CompactionizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCompactionizabilityAdminRecords(
  inventory: WorkspaceCompactionizabilityDomainInventory[],
): CompactionizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCompactionizabilityAdminStats(input: {
  records: CompactionizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CompactionizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const compactionizabilityPercent =
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
    compactionizabilityPercent,
  }
}

export function getCompactionizabilityAdminGuidance(input: {
  stats: CompactionizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect compactionizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial compactionizability coverage and refresh the compactionizability summary.'
  }

  if (input.stats.compactionizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook compactionizability below the 95% target and refresh the compactionizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace compactionizability coverage and refresh the compactionizability summary.'
}

export function resolveCompactionizabilityAdminActions(): CompactionizabilityAdminAction[] {
  return ['refresh_compactionizability_summary']
}
