import type {
  SymbolizabilityAdminAction,
  SymbolizabilityAdminRecord,
  SymbolizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSymbolizabilityDomainInventory = {
  domain: SymbolizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSymbolizabilityAdminRecords(
  inventory: WorkspaceSymbolizabilityDomainInventory[],
): SymbolizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSymbolizabilityAdminStats(input: {
  records: SymbolizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SymbolizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_records')
      ?.recordCount ?? 0
  const symbolizabilityPercent =
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
    symbolizabilityPercent,
  }
}

export function getSymbolizabilityAdminGuidance(input: {
  stats: SymbolizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect symbolizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial symbolizability coverage and refresh the symbolizability summary.'
  }

  if (input.stats.symbolizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing record symbolizability below the 95% target and refresh the symbolizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace symbolizability coverage and refresh the symbolizability summary.'
}

export function resolveSymbolizabilityAdminActions(): SymbolizabilityAdminAction[] {
  return ['refresh_symbolizability_summary']
}
