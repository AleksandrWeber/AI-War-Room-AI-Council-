import type {
  RelayizabilityAdminAction,
  RelayizabilityAdminRecord,
  RelayizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRelayizabilityDomainInventory = {
  domain: RelayizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRelayizabilityAdminRecords(
  inventory: WorkspaceRelayizabilityDomainInventory[],
): RelayizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRelayizabilityAdminStats(input: {
  records: RelayizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RelayizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const relayizabilityPercent =
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
    relayizabilityPercent,
  }
}

export function getRelayizabilityAdminGuidance(input: {
  stats: RelayizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect relayizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial relayizability coverage and refresh the relayizability summary.'
  }

  if (input.stats.relayizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health relayizability below the 95% target and refresh the relayizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace relayizability coverage and refresh the relayizability summary.'
}

export function resolveRelayizabilityAdminActions(): RelayizabilityAdminAction[] {
  return ['refresh_relayizability_summary']
}
