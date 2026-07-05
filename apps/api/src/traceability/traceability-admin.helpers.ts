import type {
  TraceabilityAdminAction,
  TraceabilityAdminRecord,
  TraceabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTraceabilityDomainInventory = {
  domain: TraceabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTraceabilityAdminRecords(
  inventory: WorkspaceTraceabilityDomainInventory[],
): TraceabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTraceabilityAdminStats(input: {
  records: TraceabilityAdminRecord[]
  postgresConnectivity: boolean
}): TraceabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const artifacts =
    input.records.find((record) => record.domain === 'artifacts')?.recordCount ??
    0
  const traceabilityPercent =
    completedRuns === 0
      ? 100
      : Math.min(100, Math.round((artifacts / completedRuns) * 100))

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    traceabilityPercent,
  }
}

export function getTraceabilityAdminGuidance(input: {
  stats: TraceabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect traceability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial traceability coverage and refresh the traceability summary.'
  }

  if (input.stats.traceabilityPercent < 95) {
    return 'Workspace owners and admins can inspect artifact lineage below the 95% target and refresh the traceability summary.'
  }

  return 'Workspace owners and admins can inspect workspace traceability coverage and refresh the traceability summary.'
}

export function resolveTraceabilityAdminActions(): TraceabilityAdminAction[] {
  return ['refresh_traceability_summary']
}
