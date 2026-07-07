import type {
  MeasurabilityvaultizabilityAdminAction,
  MeasurabilityvaultizabilityAdminRecord,
  MeasurabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMeasurabilityvaultizabilityDomainInventory = {
  domain: MeasurabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMeasurabilityvaultizabilityAdminRecords(
  inventory: WorkspaceMeasurabilityvaultizabilityDomainInventory[],
): MeasurabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMeasurabilityvaultizabilityAdminStats(input: {
  records: MeasurabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): MeasurabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const measurabilityvaultizabilityPercent =
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
    measurabilityvaultizabilityPercent,
  }
}

export function getMeasurabilityvaultizabilityAdminGuidance(input: {
  stats: MeasurabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect measurabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial measurabilityvaultizability coverage and refresh the measurabilityvaultizability summary.'
  }

  if (input.stats.measurabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership measurabilityvaultizability below the 95% target and refresh the measurabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace measurabilityvaultizability coverage and refresh the measurabilityvaultizability summary.'
}

export function resolveMeasurabilityvaultizabilityAdminActions(): MeasurabilityvaultizabilityAdminAction[] {
  return ['refresh_measurabilityvaultizability_summary']
}
