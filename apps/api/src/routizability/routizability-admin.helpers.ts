import type {
  RoutizabilityAdminAction,
  RoutizabilityAdminRecord,
  RoutizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRoutizabilityDomainInventory = {
  domain: RoutizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRoutizabilityAdminRecords(
  inventory: WorkspaceRoutizabilityDomainInventory[],
): RoutizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRoutizabilityAdminStats(input: {
  records: RoutizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RoutizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const routizabilityPercent =
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
    routizabilityPercent,
  }
}

export function getRoutizabilityAdminGuidance(input: {
  stats: RoutizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect routizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial routizability coverage and refresh the routizability summary.'
  }

  if (input.stats.routizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan routizability below the 95% target and refresh the routizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace routizability coverage and refresh the routizability summary.'
}

export function resolveRoutizabilityAdminActions(): RoutizabilityAdminAction[] {
  return ['refresh_routizability_summary']
}
