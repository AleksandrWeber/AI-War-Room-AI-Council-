import type {
  ReplicabilizabilityAdminAction,
  ReplicabilizabilityAdminRecord,
  ReplicabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceReplicabilizabilityDomainInventory = {
  domain: ReplicabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildReplicabilizabilityAdminRecords(
  inventory: WorkspaceReplicabilizabilityDomainInventory[],
): ReplicabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildReplicabilizabilityAdminStats(input: {
  records: ReplicabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ReplicabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const replicabilizabilityPercent =
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
    replicabilizabilityPercent,
  }
}

export function getReplicabilizabilityAdminGuidance(input: {
  stats: ReplicabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect replicabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial replicabilizability coverage and refresh the replicabilizability summary.'
  }

  if (input.stats.replicabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage replicabilizability below the 95% target and refresh the replicabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace replicabilizability coverage and refresh the replicabilizability summary.'
}

export function resolveReplicabilizabilityAdminActions(): ReplicabilizabilityAdminAction[] {
  return ['refresh_replicabilizability_summary']
}
