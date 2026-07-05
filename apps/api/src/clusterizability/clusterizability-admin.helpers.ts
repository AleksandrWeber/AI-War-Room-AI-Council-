import type {
  ClusterizabilityAdminAction,
  ClusterizabilityAdminRecord,
  ClusterizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceClusterizabilityDomainInventory = {
  domain: ClusterizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildClusterizabilityAdminRecords(
  inventory: WorkspaceClusterizabilityDomainInventory[],
): ClusterizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildClusterizabilityAdminStats(input: {
  records: ClusterizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ClusterizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const clusterizabilityPercent =
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
    clusterizabilityPercent,
  }
}

export function getClusterizabilityAdminGuidance(input: {
  stats: ClusterizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect clusterizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial clusterizability coverage and refresh the clusterizability summary.'
  }

  if (input.stats.clusterizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential clusterizability below the 95% target and refresh the clusterizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace clusterizability coverage and refresh the clusterizability summary.'
}

export function resolveClusterizabilityAdminActions(): ClusterizabilityAdminAction[] {
  return ['refresh_clusterizability_summary']
}
