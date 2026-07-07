import type {
  TraceledgerizabilityAdminAction,
  TraceledgerizabilityAdminRecord,
  TraceledgerizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTraceledgerizabilityDomainInventory = {
  domain: TraceledgerizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTraceledgerizabilityAdminRecords(
  inventory: WorkspaceTraceledgerizabilityDomainInventory[],
): TraceledgerizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTraceledgerizabilityAdminStats(input: {
  records: TraceledgerizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TraceledgerizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const traceledgerizabilityPercent =
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
    traceledgerizabilityPercent,
  }
}

export function getTraceledgerizabilityAdminGuidance(input: {
  stats: TraceledgerizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect traceledgerizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial traceledgerizability coverage and refresh the traceledgerizability summary.'
  }

  if (input.stats.traceledgerizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership traceledgerizability below the 95% target and refresh the traceledgerizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace traceledgerizability coverage and refresh the traceledgerizability summary.'
}

export function resolveTraceledgerizabilityAdminActions(): TraceledgerizabilityAdminAction[] {
  return ['refresh_traceledgerizability_summary']
}
