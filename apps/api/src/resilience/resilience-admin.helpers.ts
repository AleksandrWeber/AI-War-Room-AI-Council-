import type {
  ResilienceAdminAction,
  ResilienceAdminRecord,
  ResilienceAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceResilienceDomainInventory = {
  domain: ResilienceAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildResilienceAdminRecords(
  inventory: WorkspaceResilienceDomainInventory[],
): ResilienceAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildResilienceAdminStats(input: {
  records: ResilienceAdminRecord[]
  postgresConnectivity: boolean
}): ResilienceAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const failedRuns =
    input.records.find((record) => record.domain === 'failed_runs')
      ?.recordCount ?? 0
  const totalOutcomeRuns = completedRuns + failedRuns
  const recoveryReadinessPercent =
    totalOutcomeRuns === 0
      ? 100
      : Math.round((completedRuns / totalOutcomeRuns) * 100)

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    recoveryReadinessPercent,
  }
}

export function getResilienceAdminGuidance(input: { stats: ResilienceAdminStats }) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect resilience metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial resilience coverage and refresh the resilience summary.'
  }

  if (input.stats.recoveryReadinessPercent < 95) {
    return 'Workspace owners and admins can inspect run recovery readiness below the 95% target and refresh the resilience summary.'
  }

  return 'Workspace owners and admins can inspect workspace resilience coverage and refresh the resilience summary.'
}

export function resolveResilienceAdminActions(): ResilienceAdminAction[] {
  return ['refresh_resilience_summary']
}
