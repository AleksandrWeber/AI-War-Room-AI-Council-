import type {
  TelemetryizabilityAdminAction,
  TelemetryizabilityAdminRecord,
  TelemetryizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTelemetryizabilityDomainInventory = {
  domain: TelemetryizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTelemetryizabilityAdminRecords(
  inventory: WorkspaceTelemetryizabilityDomainInventory[],
): TelemetryizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTelemetryizabilityAdminStats(input: {
  records: TelemetryizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TelemetryizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const telemetryizabilityPercent =
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
    telemetryizabilityPercent,
  }
}

export function getTelemetryizabilityAdminGuidance(input: {
  stats: TelemetryizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect telemetryizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial telemetryizability coverage and refresh the telemetryizability summary.'
  }

  if (input.stats.telemetryizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification telemetryizability below the 95% target and refresh the telemetryizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace telemetryizability coverage and refresh the telemetryizability summary.'
}

export function resolveTelemetryizabilityAdminActions(): TelemetryizabilityAdminAction[] {
  return ['refresh_telemetryizability_summary']
}
