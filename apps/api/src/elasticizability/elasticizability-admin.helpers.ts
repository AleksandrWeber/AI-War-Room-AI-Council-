import type {
  ElasticizabilityAdminAction,
  ElasticizabilityAdminRecord,
  ElasticizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceElasticizabilityDomainInventory = {
  domain: ElasticizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildElasticizabilityAdminRecords(
  inventory: WorkspaceElasticizabilityDomainInventory[],
): ElasticizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildElasticizabilityAdminStats(input: {
  records: ElasticizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ElasticizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const elasticizabilityPercent =
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
    elasticizabilityPercent,
  }
}

export function getElasticizabilityAdminGuidance(input: {
  stats: ElasticizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect elasticizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial elasticizability coverage and refresh the elasticizability summary.'
  }

  if (input.stats.elasticizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key elasticizability below the 95% target and refresh the elasticizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace elasticizability coverage and refresh the elasticizability summary.'
}

export function resolveElasticizabilityAdminActions(): ElasticizabilityAdminAction[] {
  return ['refresh_elasticizability_summary']
}
