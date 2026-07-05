import type {
  GatewayizabilityAdminAction,
  GatewayizabilityAdminRecord,
  GatewayizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceGatewayizabilityDomainInventory = {
  domain: GatewayizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildGatewayizabilityAdminRecords(
  inventory: WorkspaceGatewayizabilityDomainInventory[],
): GatewayizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildGatewayizabilityAdminStats(input: {
  records: GatewayizabilityAdminRecord[]
  postgresConnectivity: boolean
}): GatewayizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const gatewayizabilityPercent =
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
    gatewayizabilityPercent,
  }
}

export function getGatewayizabilityAdminGuidance(input: {
  stats: GatewayizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect gatewayizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial gatewayizability coverage and refresh the gatewayizability summary.'
  }

  if (input.stats.gatewayizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit gatewayizability below the 95% target and refresh the gatewayizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace gatewayizability coverage and refresh the gatewayizability summary.'
}

export function resolveGatewayizabilityAdminActions(): GatewayizabilityAdminAction[] {
  return ['refresh_gatewayizability_summary']
}
