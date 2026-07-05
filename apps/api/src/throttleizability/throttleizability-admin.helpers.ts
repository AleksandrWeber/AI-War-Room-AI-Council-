import type {
  ThrottleizabilityAdminAction,
  ThrottleizabilityAdminRecord,
  ThrottleizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceThrottleizabilityDomainInventory = {
  domain: ThrottleizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildThrottleizabilityAdminRecords(
  inventory: WorkspaceThrottleizabilityDomainInventory[],
): ThrottleizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildThrottleizabilityAdminStats(input: {
  records: ThrottleizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ThrottleizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const throttleizabilityPercent =
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
    throttleizabilityPercent,
  }
}

export function getThrottleizabilityAdminGuidance(input: {
  stats: ThrottleizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect throttleizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial throttleizability coverage and refresh the throttleizability summary.'
  }

  if (input.stats.throttleizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential throttleizability below the 95% target and refresh the throttleizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace throttleizability coverage and refresh the throttleizability summary.'
}

export function resolveThrottleizabilityAdminActions(): ThrottleizabilityAdminAction[] {
  return ['refresh_throttleizability_summary']
}
