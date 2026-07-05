import type {
  CalibratizabilityAdminAction,
  CalibratizabilityAdminRecord,
  CalibratizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCalibratizabilityDomainInventory = {
  domain: CalibratizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCalibratizabilityAdminRecords(
  inventory: WorkspaceCalibratizabilityDomainInventory[],
): CalibratizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCalibratizabilityAdminStats(input: {
  records: CalibratizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CalibratizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const calibratizabilityPercent =
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
    calibratizabilityPercent,
  }
}

export function getCalibratizabilityAdminGuidance(input: {
  stats: CalibratizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect calibratizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial calibratizability coverage and refresh the calibratizability summary.'
  }

  if (input.stats.calibratizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan calibratizability below the 95% target and refresh the calibratizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace calibratizability coverage and refresh the calibratizability summary.'
}

export function resolveCalibratizabilityAdminActions(): CalibratizabilityAdminAction[] {
  return ['refresh_calibratizability_summary']
}
