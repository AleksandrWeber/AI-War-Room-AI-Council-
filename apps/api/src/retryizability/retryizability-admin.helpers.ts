import type {
  RetryizabilityAdminAction,
  RetryizabilityAdminRecord,
  RetryizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRetryizabilityDomainInventory = {
  domain: RetryizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRetryizabilityAdminRecords(
  inventory: WorkspaceRetryizabilityDomainInventory[],
): RetryizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRetryizabilityAdminStats(input: {
  records: RetryizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RetryizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const retryizabilityPercent =
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
    retryizabilityPercent,
  }
}

export function getRetryizabilityAdminGuidance(input: {
  stats: RetryizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect retryizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial retryizability coverage and refresh the retryizability summary.'
  }

  if (input.stats.retryizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership retryizability below the 95% target and refresh the retryizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace retryizability coverage and refresh the retryizability summary.'
}

export function resolveRetryizabilityAdminActions(): RetryizabilityAdminAction[] {
  return ['refresh_retryizability_summary']
}
