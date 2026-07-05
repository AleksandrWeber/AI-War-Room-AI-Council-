import type {
  ReplicationizabilityAdminAction,
  ReplicationizabilityAdminRecord,
  ReplicationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceReplicationizabilityDomainInventory = {
  domain: ReplicationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildReplicationizabilityAdminRecords(
  inventory: WorkspaceReplicationizabilityDomainInventory[],
): ReplicationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildReplicationizabilityAdminStats(input: {
  records: ReplicationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ReplicationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const replicationizabilityPercent =
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
    replicationizabilityPercent,
  }
}

export function getReplicationizabilityAdminGuidance(input: {
  stats: ReplicationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect replicationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial replicationizability coverage and refresh the replicationizability summary.'
  }

  if (input.stats.replicationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook replicationizability below the 95% target and refresh the replicationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace replicationizability coverage and refresh the replicationizability summary.'
}

export function resolveReplicationizabilityAdminActions(): ReplicationizabilityAdminAction[] {
  return ['refresh_replicationizability_summary']
}
