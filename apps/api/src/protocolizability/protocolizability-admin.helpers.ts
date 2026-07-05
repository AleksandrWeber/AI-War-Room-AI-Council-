import type {
  ProtocolizabilityAdminAction,
  ProtocolizabilityAdminRecord,
  ProtocolizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceProtocolizabilityDomainInventory = {
  domain: ProtocolizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildProtocolizabilityAdminRecords(
  inventory: WorkspaceProtocolizabilityDomainInventory[],
): ProtocolizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildProtocolizabilityAdminStats(input: {
  records: ProtocolizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ProtocolizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const protocolizabilityPercent =
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
    protocolizabilityPercent,
  }
}

export function getProtocolizabilityAdminGuidance(input: {
  stats: ProtocolizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect protocolizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial protocolizability coverage and refresh the protocolizability summary.'
  }

  if (input.stats.protocolizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health protocolizability below the 95% target and refresh the protocolizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace protocolizability coverage and refresh the protocolizability summary.'
}

export function resolveProtocolizabilityAdminActions(): ProtocolizabilityAdminAction[] {
  return ['refresh_protocolizability_summary']
}
