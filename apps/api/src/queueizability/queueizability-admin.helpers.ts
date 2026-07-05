import type {
  QueueizabilityAdminAction,
  QueueizabilityAdminRecord,
  QueueizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceQueueizabilityDomainInventory = {
  domain: QueueizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildQueueizabilityAdminRecords(
  inventory: WorkspaceQueueizabilityDomainInventory[],
): QueueizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildQueueizabilityAdminStats(input: {
  records: QueueizabilityAdminRecord[]
  postgresConnectivity: boolean
}): QueueizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const queueizabilityPercent =
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
    queueizabilityPercent,
  }
}

export function getQueueizabilityAdminGuidance(input: {
  stats: QueueizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect queueizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial queueizability coverage and refresh the queueizability summary.'
  }

  if (input.stats.queueizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key queueizability below the 95% target and refresh the queueizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace queueizability coverage and refresh the queueizability summary.'
}

export function resolveQueueizabilityAdminActions(): QueueizabilityAdminAction[] {
  return ['refresh_queueizability_summary']
}
