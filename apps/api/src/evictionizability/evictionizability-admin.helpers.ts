import type {
  EvictionizabilityAdminAction,
  EvictionizabilityAdminRecord,
  EvictionizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceEvictionizabilityDomainInventory = {
  domain: EvictionizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildEvictionizabilityAdminRecords(
  inventory: WorkspaceEvictionizabilityDomainInventory[],
): EvictionizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildEvictionizabilityAdminStats(input: {
  records: EvictionizabilityAdminRecord[]
  postgresConnectivity: boolean
}): EvictionizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const evictionizabilityPercent =
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
    evictionizabilityPercent,
  }
}

export function getEvictionizabilityAdminGuidance(input: {
  stats: EvictionizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect evictionizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial evictionizability coverage and refresh the evictionizability summary.'
  }

  if (input.stats.evictionizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership evictionizability below the 95% target and refresh the evictionizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace evictionizability coverage and refresh the evictionizability summary.'
}

export function resolveEvictionizabilityAdminActions(): EvictionizabilityAdminAction[] {
  return ['refresh_evictionizability_summary']
}
