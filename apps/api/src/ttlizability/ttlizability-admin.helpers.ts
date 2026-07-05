import type {
  TtlizabilityAdminAction,
  TtlizabilityAdminRecord,
  TtlizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTtlizabilityDomainInventory = {
  domain: TtlizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTtlizabilityAdminRecords(
  inventory: WorkspaceTtlizabilityDomainInventory[],
): TtlizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTtlizabilityAdminStats(input: {
  records: TtlizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TtlizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const ttlizabilityPercent =
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
    ttlizabilityPercent,
  }
}

export function getTtlizabilityAdminGuidance(input: {
  stats: TtlizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect ttlizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial ttlizability coverage and refresh the ttlizability summary.'
  }

  if (input.stats.ttlizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice ttlizability below the 95% target and refresh the ttlizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace ttlizability coverage and refresh the ttlizability summary.'
}

export function resolveTtlizabilityAdminActions(): TtlizabilityAdminAction[] {
  return ['refresh_ttlizability_summary']
}
