import type {
  ClusteringizabilityAdminAction,
  ClusteringizabilityAdminRecord,
  ClusteringizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceClusteringizabilityDomainInventory = {
  domain: ClusteringizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildClusteringizabilityAdminRecords(
  inventory: WorkspaceClusteringizabilityDomainInventory[],
): ClusteringizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildClusteringizabilityAdminStats(input: {
  records: ClusteringizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ClusteringizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const clusteringizabilityPercent =
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
    clusteringizabilityPercent,
  }
}

export function getClusteringizabilityAdminGuidance(input: {
  stats: ClusteringizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect clusteringizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial clusteringizability coverage and refresh the clusteringizability summary.'
  }

  if (input.stats.clusteringizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice clusteringizability below the 95% target and refresh the clusteringizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace clusteringizability coverage and refresh the clusteringizability summary.'
}

export function resolveClusteringizabilityAdminActions(): ClusteringizabilityAdminAction[] {
  return ['refresh_clusteringizability_summary']
}
