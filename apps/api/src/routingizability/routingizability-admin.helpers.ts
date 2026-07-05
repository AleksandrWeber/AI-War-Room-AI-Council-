import type {
  RoutingizabilityAdminAction,
  RoutingizabilityAdminRecord,
  RoutingizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRoutingizabilityDomainInventory = {
  domain: RoutingizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRoutingizabilityAdminRecords(
  inventory: WorkspaceRoutingizabilityDomainInventory[],
): RoutingizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRoutingizabilityAdminStats(input: {
  records: RoutingizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RoutingizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const routingizabilityPercent =
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
    routingizabilityPercent,
  }
}

export function getRoutingizabilityAdminGuidance(input: {
  stats: RoutingizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect routingizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial routingizability coverage and refresh the routingizability summary.'
  }

  if (input.stats.routingizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential routingizability below the 95% target and refresh the routingizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace routingizability coverage and refresh the routingizability summary.'
}

export function resolveRoutingizabilityAdminActions(): RoutingizabilityAdminAction[] {
  return ['refresh_routingizability_summary']
}
