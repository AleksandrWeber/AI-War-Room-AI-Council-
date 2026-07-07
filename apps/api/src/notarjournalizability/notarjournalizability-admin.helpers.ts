import type {
  NotarjournalizabilityAdminAction,
  NotarjournalizabilityAdminRecord,
  NotarjournalizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceNotarjournalizabilityDomainInventory = {
  domain: NotarjournalizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildNotarjournalizabilityAdminRecords(
  inventory: WorkspaceNotarjournalizabilityDomainInventory[],
): NotarjournalizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildNotarjournalizabilityAdminStats(input: {
  records: NotarjournalizabilityAdminRecord[]
  postgresConnectivity: boolean
}): NotarjournalizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const notarjournalizabilityPercent =
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
    notarjournalizabilityPercent,
  }
}

export function getNotarjournalizabilityAdminGuidance(input: {
  stats: NotarjournalizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect notarjournalizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial notarjournalizability coverage and refresh the notarjournalizability summary.'
  }

  if (input.stats.notarjournalizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership notarjournalizability below the 95% target and refresh the notarjournalizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace notarjournalizability coverage and refresh the notarjournalizability summary.'
}

export function resolveNotarjournalizabilityAdminActions(): NotarjournalizabilityAdminAction[] {
  return ['refresh_notarjournalizability_summary']
}
