import type {
  StochasticizabilityAdminAction,
  StochasticizabilityAdminRecord,
  StochasticizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceStochasticizabilityDomainInventory = {
  domain: StochasticizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildStochasticizabilityAdminRecords(
  inventory: WorkspaceStochasticizabilityDomainInventory[],
): StochasticizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildStochasticizabilityAdminStats(input: {
  records: StochasticizabilityAdminRecord[]
  postgresConnectivity: boolean
}): StochasticizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const stochasticizabilityPercent =
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
    stochasticizabilityPercent,
  }
}

export function getStochasticizabilityAdminGuidance(input: {
  stats: StochasticizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect stochasticizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial stochasticizability coverage and refresh the stochasticizability summary.'
  }

  if (input.stats.stochasticizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage stochasticizability below the 95% target and refresh the stochasticizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace stochasticizability coverage and refresh the stochasticizability summary.'
}

export function resolveStochasticizabilityAdminActions(): StochasticizabilityAdminAction[] {
  return ['refresh_stochasticizability_summary']
}
