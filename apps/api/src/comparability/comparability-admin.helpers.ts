import type {
  ComparabilityAdminAction,
  ComparabilityAdminRecord,
  ComparabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceComparabilityDomainInventory = {
  domain: ComparabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildComparabilityAdminRecords(
  inventory: WorkspaceComparabilityDomainInventory[],
): ComparabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildComparabilityAdminStats(input: {
  records: ComparabilityAdminRecord[]
  postgresConnectivity: boolean
}): ComparabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const comparabilityPercent =
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
    comparabilityPercent,
  }
}

export function getComparabilityAdminGuidance(input: {
  stats: ComparabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect comparability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial comparability coverage and refresh the comparability summary.'
  }

  if (input.stats.comparabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice comparability below the 95% target and refresh the comparability summary.'
  }

  return 'Workspace owners and admins can inspect workspace comparability coverage and refresh the comparability summary.'
}

export function resolveComparabilityAdminActions(): ComparabilityAdminAction[] {
  return ['refresh_comparability_summary']
}
