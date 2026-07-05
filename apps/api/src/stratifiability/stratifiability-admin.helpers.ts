import type {
  StratifiabilityAdminAction,
  StratifiabilityAdminRecord,
  StratifiabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceStratifiabilityDomainInventory = {
  domain: StratifiabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildStratifiabilityAdminRecords(
  inventory: WorkspaceStratifiabilityDomainInventory[],
): StratifiabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildStratifiabilityAdminStats(input: {
  records: StratifiabilityAdminRecord[]
  postgresConnectivity: boolean
}): StratifiabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const stratifiabilityPercent =
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
    stratifiabilityPercent,
  }
}

export function getStratifiabilityAdminGuidance(input: {
  stats: StratifiabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect stratifiability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial stratifiability coverage and refresh the stratifiability summary.'
  }

  if (input.stats.stratifiabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice stratifiability below the 95% target and refresh the stratifiability summary.'
  }

  return 'Workspace owners and admins can inspect workspace stratifiability coverage and refresh the stratifiability summary.'
}

export function resolveStratifiabilityAdminActions(): StratifiabilityAdminAction[] {
  return ['refresh_stratifiability_summary']
}
