import type {
  PluggabilizabilityAdminAction,
  PluggabilizabilityAdminRecord,
  PluggabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePluggabilizabilityDomainInventory = {
  domain: PluggabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPluggabilizabilityAdminRecords(
  inventory: WorkspacePluggabilizabilityDomainInventory[],
): PluggabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPluggabilizabilityAdminStats(input: {
  records: PluggabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): PluggabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const pluggabilizabilityPercent =
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
    pluggabilizabilityPercent,
  }
}

export function getPluggabilizabilityAdminGuidance(input: {
  stats: PluggabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect pluggabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial pluggabilizability coverage and refresh the pluggabilizability summary.'
  }

  if (input.stats.pluggabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification pluggabilizability below the 95% target and refresh the pluggabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace pluggabilizability coverage and refresh the pluggabilizability summary.'
}

export function resolvePluggabilizabilityAdminActions(): PluggabilizabilityAdminAction[] {
  return ['refresh_pluggabilizability_summary']
}
