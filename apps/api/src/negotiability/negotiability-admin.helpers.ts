import type {
  NegotiabilityAdminAction,
  NegotiabilityAdminRecord,
  NegotiabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceNegotiabilityDomainInventory = {
  domain: NegotiabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildNegotiabilityAdminRecords(
  inventory: WorkspaceNegotiabilityDomainInventory[],
): NegotiabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildNegotiabilityAdminStats(input: {
  records: NegotiabilityAdminRecord[]
  postgresConnectivity: boolean
}): NegotiabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const negotiabilityPercent =
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
    negotiabilityPercent,
  }
}

export function getNegotiabilityAdminGuidance(input: {
  stats: NegotiabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect negotiability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial negotiability coverage and refresh the negotiability summary.'
  }

  if (input.stats.negotiabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice negotiability below the 95% target and refresh the negotiability summary.'
  }

  return 'Workspace owners and admins can inspect workspace negotiability coverage and refresh the negotiability summary.'
}

export function resolveNegotiabilityAdminActions(): NegotiabilityAdminAction[] {
  return ['refresh_negotiability_summary']
}
