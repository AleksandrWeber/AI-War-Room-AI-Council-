import type {
  ConsolidatizabilityAdminAction,
  ConsolidatizabilityAdminRecord,
  ConsolidatizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceConsolidatizabilityDomainInventory = {
  domain: ConsolidatizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildConsolidatizabilityAdminRecords(
  inventory: WorkspaceConsolidatizabilityDomainInventory[],
): ConsolidatizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildConsolidatizabilityAdminStats(input: {
  records: ConsolidatizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ConsolidatizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const consolidatizabilityPercent =
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
    consolidatizabilityPercent,
  }
}

export function getConsolidatizabilityAdminGuidance(input: {
  stats: ConsolidatizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect consolidatizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial consolidatizability coverage and refresh the consolidatizability summary.'
  }

  if (input.stats.consolidatizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook consolidatizability below the 95% target and refresh the consolidatizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace consolidatizability coverage and refresh the consolidatizability summary.'
}

export function resolveConsolidatizabilityAdminActions(): ConsolidatizabilityAdminAction[] {
  return ['refresh_consolidatizability_summary']
}
