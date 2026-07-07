import type {
  TraceproofizabilityAdminAction,
  TraceproofizabilityAdminRecord,
  TraceproofizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTraceproofizabilityDomainInventory = {
  domain: TraceproofizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTraceproofizabilityAdminRecords(
  inventory: WorkspaceTraceproofizabilityDomainInventory[],
): TraceproofizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTraceproofizabilityAdminStats(input: {
  records: TraceproofizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TraceproofizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const traceproofizabilityPercent =
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
    traceproofizabilityPercent,
  }
}

export function getTraceproofizabilityAdminGuidance(input: {
  stats: TraceproofizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect traceproofizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial traceproofizability coverage and refresh the traceproofizability summary.'
  }

  if (input.stats.traceproofizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership traceproofizability below the 95% target and refresh the traceproofizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace traceproofizability coverage and refresh the traceproofizability summary.'
}

export function resolveTraceproofizabilityAdminActions(): TraceproofizabilityAdminAction[] {
  return ['refresh_traceproofizability_summary']
}
