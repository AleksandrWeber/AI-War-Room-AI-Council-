import type {
  RollbackabilizabilityAdminAction,
  RollbackabilizabilityAdminRecord,
  RollbackabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRollbackabilizabilityDomainInventory = {
  domain: RollbackabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRollbackabilizabilityAdminRecords(
  inventory: WorkspaceRollbackabilizabilityDomainInventory[],
): RollbackabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRollbackabilizabilityAdminStats(input: {
  records: RollbackabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RollbackabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const rollbackabilizabilityPercent =
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
    rollbackabilizabilityPercent,
  }
}

export function getRollbackabilizabilityAdminGuidance(input: {
  stats: RollbackabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect rollbackabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial rollbackabilizability coverage and refresh the rollbackabilizability summary.'
  }

  if (input.stats.rollbackabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook rollbackabilizability below the 95% target and refresh the rollbackabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace rollbackabilizability coverage and refresh the rollbackabilizability summary.'
}

export function resolveRollbackabilizabilityAdminActions(): RollbackabilizabilityAdminAction[] {
  return ['refresh_rollbackabilizability_summary']
}
