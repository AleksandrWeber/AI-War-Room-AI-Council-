import type {
  OrchestrizabilityAdminAction,
  OrchestrizabilityAdminRecord,
  OrchestrizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceOrchestrizabilityDomainInventory = {
  domain: OrchestrizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildOrchestrizabilityAdminRecords(
  inventory: WorkspaceOrchestrizabilityDomainInventory[],
): OrchestrizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildOrchestrizabilityAdminStats(input: {
  records: OrchestrizabilityAdminRecord[]
  postgresConnectivity: boolean
}): OrchestrizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const orchestrizabilityPercent =
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
    orchestrizabilityPercent,
  }
}

export function getOrchestrizabilityAdminGuidance(input: {
  stats: OrchestrizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect orchestrizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial orchestrizability coverage and refresh the orchestrizability summary.'
  }

  if (input.stats.orchestrizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership orchestrizability below the 95% target and refresh the orchestrizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace orchestrizability coverage and refresh the orchestrizability summary.'
}

export function resolveOrchestrizabilityAdminActions(): OrchestrizabilityAdminAction[] {
  return ['refresh_orchestrizability_summary']
}
