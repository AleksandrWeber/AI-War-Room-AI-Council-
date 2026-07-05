import type {
  RecoverabilityAdminAction,
  RecoverabilityAdminRecord,
  RecoverabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRecoverabilityDomainInventory = {
  domain: RecoverabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRecoverabilityAdminRecords(
  inventory: WorkspaceRecoverabilityDomainInventory[],
): RecoverabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRecoverabilityAdminStats(input: {
  records: RecoverabilityAdminRecord[]
  postgresConnectivity: boolean
}): RecoverabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const failedRuns =
    input.records.find((record) => record.domain === 'failed_runs')
      ?.recordCount ?? 0
  const blockedRuns =
    input.records.find((record) => record.domain === 'blocked_runs')
      ?.recordCount ?? 0
  const totalOutcomeRuns = completedRuns + failedRuns + blockedRuns
  const recoverabilityPercent =
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
    recoverabilityPercent,
  }
}

export function getRecoverabilityAdminGuidance(input: {
  stats: RecoverabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect recoverability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial recoverability coverage and refresh the recoverability summary.'
  }

  if (input.stats.recoverabilityPercent < 95) {
    return 'Workspace owners and admins can inspect recoverability below the 95% target and refresh the recoverability summary.'
  }

  return 'Workspace owners and admins can inspect workspace recoverability coverage and refresh the recoverability summary.'
}

export function resolveRecoverabilityAdminActions(): RecoverabilityAdminAction[] {
  return ['refresh_recoverability_summary']
}
