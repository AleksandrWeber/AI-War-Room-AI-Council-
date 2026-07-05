import type {
  RecoveryizabilityAdminAction,
  RecoveryizabilityAdminRecord,
  RecoveryizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRecoveryizabilityDomainInventory = {
  domain: RecoveryizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRecoveryizabilityAdminRecords(
  inventory: WorkspaceRecoveryizabilityDomainInventory[],
): RecoveryizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRecoveryizabilityAdminStats(input: {
  records: RecoveryizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RecoveryizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const recoveryizabilityPercent =
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
    recoveryizabilityPercent,
  }
}

export function getRecoveryizabilityAdminGuidance(input: {
  stats: RecoveryizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect recoveryizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial recoveryizability coverage and refresh the recoveryizability summary.'
  }

  if (input.stats.recoveryizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification recoveryizability below the 95% target and refresh the recoveryizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace recoveryizability coverage and refresh the recoveryizability summary.'
}

export function resolveRecoveryizabilityAdminActions(): RecoveryizabilityAdminAction[] {
  return ['refresh_recoveryizability_summary']
}
