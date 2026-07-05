import type {
  MeasurabilityAdminAction,
  MeasurabilityAdminRecord,
  MeasurabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMeasurabilityDomainInventory = {
  domain: MeasurabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMeasurabilityAdminRecords(
  inventory: WorkspaceMeasurabilityDomainInventory[],
): MeasurabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMeasurabilityAdminStats(input: {
  records: MeasurabilityAdminRecord[]
  postgresConnectivity: boolean
}): MeasurabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const measurabilityPercent =
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
    measurabilityPercent,
  }
}

export function getMeasurabilityAdminGuidance(input: {
  stats: MeasurabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect measurability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial measurability coverage and refresh the measurability summary.'
  }

  if (input.stats.measurabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage measurability below the 95% target and refresh the measurability summary.'
  }

  return 'Workspace owners and admins can inspect workspace measurability coverage and refresh the measurability summary.'
}

export function resolveMeasurabilityAdminActions(): MeasurabilityAdminAction[] {
  return ['refresh_measurability_summary']
}
