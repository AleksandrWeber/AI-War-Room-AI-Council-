import type {
  GroupizabilityAdminAction,
  GroupizabilityAdminRecord,
  GroupizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceGroupizabilityDomainInventory = {
  domain: GroupizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildGroupizabilityAdminRecords(
  inventory: WorkspaceGroupizabilityDomainInventory[],
): GroupizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildGroupizabilityAdminStats(input: {
  records: GroupizabilityAdminRecord[]
  postgresConnectivity: boolean
}): GroupizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const groupizabilityPercent =
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
    groupizabilityPercent,
  }
}

export function getGroupizabilityAdminGuidance(input: {
  stats: GroupizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect groupizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial groupizability coverage and refresh the groupizability summary.'
  }

  if (input.stats.groupizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan groupizability below the 95% target and refresh the groupizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace groupizability coverage and refresh the groupizability summary.'
}

export function resolveGroupizabilityAdminActions(): GroupizabilityAdminAction[] {
  return ['refresh_groupizability_summary']
}
