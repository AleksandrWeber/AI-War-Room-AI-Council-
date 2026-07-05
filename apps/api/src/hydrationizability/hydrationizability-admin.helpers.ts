import type {
  HydrationizabilityAdminAction,
  HydrationizabilityAdminRecord,
  HydrationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceHydrationizabilityDomainInventory = {
  domain: HydrationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildHydrationizabilityAdminRecords(
  inventory: WorkspaceHydrationizabilityDomainInventory[],
): HydrationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildHydrationizabilityAdminStats(input: {
  records: HydrationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): HydrationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const hydrationizabilityPercent =
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
    hydrationizabilityPercent,
  }
}

export function getHydrationizabilityAdminGuidance(input: {
  stats: HydrationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect hydrationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial hydrationizability coverage and refresh the hydrationizability summary.'
  }

  if (input.stats.hydrationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan hydrationizability below the 95% target and refresh the hydrationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace hydrationizability coverage and refresh the hydrationizability summary.'
}

export function resolveHydrationizabilityAdminActions(): HydrationizabilityAdminAction[] {
  return ['refresh_hydrationizability_summary']
}
