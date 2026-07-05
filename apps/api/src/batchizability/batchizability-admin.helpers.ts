import type {
  BatchizabilityAdminAction,
  BatchizabilityAdminRecord,
  BatchizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceBatchizabilityDomainInventory = {
  domain: BatchizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildBatchizabilityAdminRecords(
  inventory: WorkspaceBatchizabilityDomainInventory[],
): BatchizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildBatchizabilityAdminStats(input: {
  records: BatchizabilityAdminRecord[]
  postgresConnectivity: boolean
}): BatchizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const batchizabilityPercent =
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
    batchizabilityPercent,
  }
}

export function getBatchizabilityAdminGuidance(input: {
  stats: BatchizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect batchizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial batchizability coverage and refresh the batchizability summary.'
  }

  if (input.stats.batchizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key batchizability below the 95% target and refresh the batchizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace batchizability coverage and refresh the batchizability summary.'
}

export function resolveBatchizabilityAdminActions(): BatchizabilityAdminAction[] {
  return ['refresh_batchizability_summary']
}
