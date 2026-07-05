import type {
  MethodizabilityAdminAction,
  MethodizabilityAdminRecord,
  MethodizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMethodizabilityDomainInventory = {
  domain: MethodizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMethodizabilityAdminRecords(
  inventory: WorkspaceMethodizabilityDomainInventory[],
): MethodizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMethodizabilityAdminStats(input: {
  records: MethodizabilityAdminRecord[]
  postgresConnectivity: boolean
}): MethodizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const methodizabilityPercent =
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
    methodizabilityPercent,
  }
}

export function getMethodizabilityAdminGuidance(input: {
  stats: MethodizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect methodizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial methodizability coverage and refresh the methodizability summary.'
  }

  if (input.stats.methodizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit methodizability below the 95% target and refresh the methodizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace methodizability coverage and refresh the methodizability summary.'
}

export function resolveMethodizabilityAdminActions(): MethodizabilityAdminAction[] {
  return ['refresh_methodizability_summary']
}
