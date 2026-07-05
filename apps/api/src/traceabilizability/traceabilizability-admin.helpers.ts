import type {
  TraceabilizabilityAdminAction,
  TraceabilizabilityAdminRecord,
  TraceabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTraceabilizabilityDomainInventory = {
  domain: TraceabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTraceabilizabilityAdminRecords(
  inventory: WorkspaceTraceabilizabilityDomainInventory[],
): TraceabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTraceabilizabilityAdminStats(input: {
  records: TraceabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TraceabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const traceabilizabilityPercent =
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
    traceabilizabilityPercent,
  }
}

export function getTraceabilizabilityAdminGuidance(input: {
  stats: TraceabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect traceabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial traceabilizability coverage and refresh the traceabilizability summary.'
  }

  if (input.stats.traceabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key traceabilizability below the 95% target and refresh the traceabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace traceabilizability coverage and refresh the traceabilizability summary.'
}

export function resolveTraceabilizabilityAdminActions(): TraceabilizabilityAdminAction[] {
  return ['refresh_traceabilizability_summary']
}
