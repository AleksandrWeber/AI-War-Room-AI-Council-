import type {
  InstrumentationizabilityAdminAction,
  InstrumentationizabilityAdminRecord,
  InstrumentationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceInstrumentationizabilityDomainInventory = {
  domain: InstrumentationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildInstrumentationizabilityAdminRecords(
  inventory: WorkspaceInstrumentationizabilityDomainInventory[],
): InstrumentationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildInstrumentationizabilityAdminStats(input: {
  records: InstrumentationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): InstrumentationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const instrumentationizabilityPercent =
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
    instrumentationizabilityPercent,
  }
}

export function getInstrumentationizabilityAdminGuidance(input: {
  stats: InstrumentationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect instrumentationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial instrumentationizability coverage and refresh the instrumentationizability summary.'
  }

  if (input.stats.instrumentationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan instrumentationizability below the 95% target and refresh the instrumentationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace instrumentationizability coverage and refresh the instrumentationizability summary.'
}

export function resolveInstrumentationizabilityAdminActions(): InstrumentationizabilityAdminAction[] {
  return ['refresh_instrumentationizability_summary']
}
