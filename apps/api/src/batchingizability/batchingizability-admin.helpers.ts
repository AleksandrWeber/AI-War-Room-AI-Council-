import type {
  BatchingizabilityAdminAction,
  BatchingizabilityAdminRecord,
  BatchingizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceBatchingizabilityDomainInventory = {
  domain: BatchingizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildBatchingizabilityAdminRecords(
  inventory: WorkspaceBatchingizabilityDomainInventory[],
): BatchingizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildBatchingizabilityAdminStats(input: {
  records: BatchingizabilityAdminRecord[]
  postgresConnectivity: boolean
}): BatchingizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const batchingizabilityPercent =
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
    batchingizabilityPercent,
  }
}

export function getBatchingizabilityAdminGuidance(input: {
  stats: BatchingizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect batchingizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial batchingizability coverage and refresh the batchingizability summary.'
  }

  if (input.stats.batchingizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership batchingizability below the 95% target and refresh the batchingizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace batchingizability coverage and refresh the batchingizability summary.'
}

export function resolveBatchingizabilityAdminActions(): BatchingizabilityAdminAction[] {
  return ['refresh_batchingizability_summary']
}
