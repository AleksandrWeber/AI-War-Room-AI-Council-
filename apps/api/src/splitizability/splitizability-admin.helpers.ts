import type {
  SplitizabilityAdminAction,
  SplitizabilityAdminRecord,
  SplitizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSplitizabilityDomainInventory = {
  domain: SplitizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSplitizabilityAdminRecords(
  inventory: WorkspaceSplitizabilityDomainInventory[],
): SplitizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSplitizabilityAdminStats(input: {
  records: SplitizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SplitizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const splitizabilityPercent =
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
    splitizabilityPercent,
  }
}

export function getSplitizabilityAdminGuidance(input: {
  stats: SplitizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect splitizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial splitizability coverage and refresh the splitizability summary.'
  }

  if (input.stats.splitizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice splitizability below the 95% target and refresh the splitizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace splitizability coverage and refresh the splitizability summary.'
}

export function resolveSplitizabilityAdminActions(): SplitizabilityAdminAction[] {
  return ['refresh_splitizability_summary']
}
