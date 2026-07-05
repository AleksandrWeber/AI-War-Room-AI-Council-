import type {
  ConvergizabilityAdminAction,
  ConvergizabilityAdminRecord,
  ConvergizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceConvergizabilityDomainInventory = {
  domain: ConvergizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildConvergizabilityAdminRecords(
  inventory: WorkspaceConvergizabilityDomainInventory[],
): ConvergizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildConvergizabilityAdminStats(input: {
  records: ConvergizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ConvergizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const convergizabilityPercent =
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
    convergizabilityPercent,
  }
}

export function getConvergizabilityAdminGuidance(input: {
  stats: ConvergizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect convergizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial convergizability coverage and refresh the convergizability summary.'
  }

  if (input.stats.convergizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit convergizability below the 95% target and refresh the convergizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace convergizability coverage and refresh the convergizability summary.'
}

export function resolveConvergizabilityAdminActions(): ConvergizabilityAdminAction[] {
  return ['refresh_convergizability_summary']
}
