import type {
  ConnectabilizabilityAdminAction,
  ConnectabilizabilityAdminRecord,
  ConnectabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceConnectabilizabilityDomainInventory = {
  domain: ConnectabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildConnectabilizabilityAdminRecords(
  inventory: WorkspaceConnectabilizabilityDomainInventory[],
): ConnectabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildConnectabilizabilityAdminStats(input: {
  records: ConnectabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ConnectabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const connectabilizabilityPercent =
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
    connectabilizabilityPercent,
  }
}

export function getConnectabilizabilityAdminGuidance(input: {
  stats: ConnectabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect connectabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial connectabilizability coverage and refresh the connectabilizability summary.'
  }

  if (input.stats.connectabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit connectabilizability below the 95% target and refresh the connectabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace connectabilizability coverage and refresh the connectabilizability summary.'
}

export function resolveConnectabilizabilityAdminActions(): ConnectabilizabilityAdminAction[] {
  return ['refresh_connectabilizability_summary']
}
