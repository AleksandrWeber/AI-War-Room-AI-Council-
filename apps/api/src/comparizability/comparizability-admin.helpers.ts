import type {
  ComparizabilityAdminAction,
  ComparizabilityAdminRecord,
  ComparizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceComparizabilityDomainInventory = {
  domain: ComparizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildComparizabilityAdminRecords(
  inventory: WorkspaceComparizabilityDomainInventory[],
): ComparizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildComparizabilityAdminStats(input: {
  records: ComparizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ComparizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const comparizabilityPercent =
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
    comparizabilityPercent,
  }
}

export function getComparizabilityAdminGuidance(input: {
  stats: ComparizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect comparizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial comparizability coverage and refresh the comparizability summary.'
  }

  if (input.stats.comparizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice comparizability below the 95% target and refresh the comparizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace comparizability coverage and refresh the comparizability summary.'
}

export function resolveComparizabilityAdminActions(): ComparizabilityAdminAction[] {
  return ['refresh_comparizability_summary']
}
