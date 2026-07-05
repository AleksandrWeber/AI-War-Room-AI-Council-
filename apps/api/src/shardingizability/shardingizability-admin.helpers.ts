import type {
  ShardingizabilityAdminAction,
  ShardingizabilityAdminRecord,
  ShardingizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceShardingizabilityDomainInventory = {
  domain: ShardingizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildShardingizabilityAdminRecords(
  inventory: WorkspaceShardingizabilityDomainInventory[],
): ShardingizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildShardingizabilityAdminStats(input: {
  records: ShardingizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ShardingizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const shardingizabilityPercent =
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
    shardingizabilityPercent,
  }
}

export function getShardingizabilityAdminGuidance(input: {
  stats: ShardingizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect shardingizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial shardingizability coverage and refresh the shardingizability summary.'
  }

  if (input.stats.shardingizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key shardingizability below the 95% target and refresh the shardingizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace shardingizability coverage and refresh the shardingizability summary.'
}

export function resolveShardingizabilityAdminActions(): ShardingizabilityAdminAction[] {
  return ['refresh_shardingizability_summary']
}
