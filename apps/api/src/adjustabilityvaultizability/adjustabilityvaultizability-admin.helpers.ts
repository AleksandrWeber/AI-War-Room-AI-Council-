import type {
  AdjustabilityvaultizabilityAdminAction,
  AdjustabilityvaultizabilityAdminRecord,
  AdjustabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAdjustabilityvaultizabilityDomainInventory = {
  domain: AdjustabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAdjustabilityvaultizabilityAdminRecords(
  inventory: WorkspaceAdjustabilityvaultizabilityDomainInventory[],
): AdjustabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAdjustabilityvaultizabilityAdminStats(input: {
  records: AdjustabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AdjustabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const adjustabilityvaultizabilityPercent =
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
    adjustabilityvaultizabilityPercent,
  }
}

export function getAdjustabilityvaultizabilityAdminGuidance(input: {
  stats: AdjustabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect adjustabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial adjustabilityvaultizability coverage and refresh the adjustabilityvaultizability summary.'
  }

  if (input.stats.adjustabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification adjustabilityvaultizability below the 95% target and refresh the adjustabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace adjustabilityvaultizability coverage and refresh the adjustabilityvaultizability summary.'
}

export function resolveAdjustabilityvaultizabilityAdminActions(): AdjustabilityvaultizabilityAdminAction[] {
  return ['refresh_adjustabilityvaultizability_summary']
}
