import type {
  IconizabilityAdminAction,
  IconizabilityAdminRecord,
  IconizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceIconizabilityDomainInventory = {
  domain: IconizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildIconizabilityAdminRecords(
  inventory: WorkspaceIconizabilityDomainInventory[],
): IconizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildIconizabilityAdminStats(input: {
  records: IconizabilityAdminRecord[]
  postgresConnectivity: boolean
}): IconizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const iconizabilityPercent =
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
    iconizabilityPercent,
  }
}

export function getIconizabilityAdminGuidance(input: {
  stats: IconizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect iconizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial iconizability coverage and refresh the iconizability summary.'
  }

  if (input.stats.iconizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan iconizability below the 95% target and refresh the iconizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace iconizability coverage and refresh the iconizability summary.'
}

export function resolveIconizabilityAdminActions(): IconizabilityAdminAction[] {
  return ['refresh_iconizability_summary']
}
