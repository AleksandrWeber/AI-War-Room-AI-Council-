import type {
  StreamizabilityAdminAction,
  StreamizabilityAdminRecord,
  StreamizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceStreamizabilityDomainInventory = {
  domain: StreamizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildStreamizabilityAdminRecords(
  inventory: WorkspaceStreamizabilityDomainInventory[],
): StreamizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildStreamizabilityAdminStats(input: {
  records: StreamizabilityAdminRecord[]
  postgresConnectivity: boolean
}): StreamizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const streamizabilityPercent =
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
    streamizabilityPercent,
  }
}

export function getStreamizabilityAdminGuidance(input: {
  stats: StreamizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect streamizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial streamizability coverage and refresh the streamizability summary.'
  }

  if (input.stats.streamizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice streamizability below the 95% target and refresh the streamizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace streamizability coverage and refresh the streamizability summary.'
}

export function resolveStreamizabilityAdminActions(): StreamizabilityAdminAction[] {
  return ['refresh_streamizability_summary']
}
