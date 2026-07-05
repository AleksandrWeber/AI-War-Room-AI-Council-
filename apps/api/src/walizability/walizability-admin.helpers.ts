import type {
  WalizabilityAdminAction,
  WalizabilityAdminRecord,
  WalizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceWalizabilityDomainInventory = {
  domain: WalizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildWalizabilityAdminRecords(
  inventory: WorkspaceWalizabilityDomainInventory[],
): WalizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildWalizabilityAdminStats(input: {
  records: WalizabilityAdminRecord[]
  postgresConnectivity: boolean
}): WalizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const walizabilityPercent =
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
    walizabilityPercent,
  }
}

export function getWalizabilityAdminGuidance(input: {
  stats: WalizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect walizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial walizability coverage and refresh the walizability summary.'
  }

  if (input.stats.walizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification walizability below the 95% target and refresh the walizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace walizability coverage and refresh the walizability summary.'
}

export function resolveWalizabilityAdminActions(): WalizabilityAdminAction[] {
  return ['refresh_walizability_summary']
}
