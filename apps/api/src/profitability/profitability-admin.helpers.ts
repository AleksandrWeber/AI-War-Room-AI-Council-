import type {
  ProfitabilityAdminAction,
  ProfitabilityAdminRecord,
  ProfitabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceProfitabilityDomainInventory = {
  domain: ProfitabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildProfitabilityAdminRecords(
  inventory: WorkspaceProfitabilityDomainInventory[],
): ProfitabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildProfitabilityAdminStats(input: {
  records: ProfitabilityAdminRecord[]
  postgresConnectivity: boolean
}): ProfitabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_records')
      ?.recordCount ?? 0
  const profitabilityPercent =
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
    profitabilityPercent,
  }
}

export function getProfitabilityAdminGuidance(input: {
  stats: ProfitabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect profitability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial profitability coverage and refresh the profitability summary.'
  }

  if (input.stats.profitabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing record profitability below the 95% target and refresh the profitability summary.'
  }

  return 'Workspace owners and admins can inspect workspace profitability coverage and refresh the profitability summary.'
}

export function resolveProfitabilityAdminActions(): ProfitabilityAdminAction[] {
  return ['refresh_profitability_summary']
}
