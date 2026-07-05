import type {
  PivotizabilityAdminAction,
  PivotizabilityAdminRecord,
  PivotizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePivotizabilityDomainInventory = {
  domain: PivotizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPivotizabilityAdminRecords(
  inventory: WorkspacePivotizabilityDomainInventory[],
): PivotizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPivotizabilityAdminStats(input: {
  records: PivotizabilityAdminRecord[]
  postgresConnectivity: boolean
}): PivotizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const pivotizabilityPercent =
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
    pivotizabilityPercent,
  }
}

export function getPivotizabilityAdminGuidance(input: {
  stats: PivotizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect pivotizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial pivotizability coverage and refresh the pivotizability summary.'
  }

  if (input.stats.pivotizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health pivotizability below the 95% target and refresh the pivotizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace pivotizability coverage and refresh the pivotizability summary.'
}

export function resolvePivotizabilityAdminActions(): PivotizabilityAdminAction[] {
  return ['refresh_pivotizability_summary']
}
