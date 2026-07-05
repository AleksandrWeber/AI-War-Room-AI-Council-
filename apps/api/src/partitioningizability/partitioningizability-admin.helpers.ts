import type {
  PartitioningizabilityAdminAction,
  PartitioningizabilityAdminRecord,
  PartitioningizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePartitioningizabilityDomainInventory = {
  domain: PartitioningizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPartitioningizabilityAdminRecords(
  inventory: WorkspacePartitioningizabilityDomainInventory[],
): PartitioningizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPartitioningizabilityAdminStats(input: {
  records: PartitioningizabilityAdminRecord[]
  postgresConnectivity: boolean
}): PartitioningizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const partitioningizabilityPercent =
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
    partitioningizabilityPercent,
  }
}

export function getPartitioningizabilityAdminGuidance(input: {
  stats: PartitioningizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect partitioningizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial partitioningizability coverage and refresh the partitioningizability summary.'
  }

  if (input.stats.partitioningizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership partitioningizability below the 95% target and refresh the partitioningizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace partitioningizability coverage and refresh the partitioningizability summary.'
}

export function resolvePartitioningizabilityAdminActions(): PartitioningizabilityAdminAction[] {
  return ['refresh_partitioningizability_summary']
}
