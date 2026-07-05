import type {
  AdjustabilityAdminAction,
  AdjustabilityAdminRecord,
  AdjustabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAdjustabilityDomainInventory = {
  domain: AdjustabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAdjustabilityAdminRecords(
  inventory: WorkspaceAdjustabilityDomainInventory[],
): AdjustabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAdjustabilityAdminStats(input: {
  records: AdjustabilityAdminRecord[]
  postgresConnectivity: boolean
}): AdjustabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const adjustabilityPercent =
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
    adjustabilityPercent,
  }
}

export function getAdjustabilityAdminGuidance(input: {
  stats: AdjustabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect adjustability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial adjustability coverage and refresh the adjustability summary.'
  }

  if (input.stats.adjustabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice adjustability below the 95% target and refresh the adjustability summary.'
  }

  return 'Workspace owners and admins can inspect workspace adjustability coverage and refresh the adjustability summary.'
}

export function resolveAdjustabilityAdminActions(): AdjustabilityAdminAction[] {
  return ['refresh_adjustability_summary']
}
