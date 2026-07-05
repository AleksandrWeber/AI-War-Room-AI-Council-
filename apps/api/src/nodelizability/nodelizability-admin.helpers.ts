import type {
  NodelizabilityAdminAction,
  NodelizabilityAdminRecord,
  NodelizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceNodelizabilityDomainInventory = {
  domain: NodelizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildNodelizabilityAdminRecords(
  inventory: WorkspaceNodelizabilityDomainInventory[],
): NodelizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildNodelizabilityAdminStats(input: {
  records: NodelizabilityAdminRecord[]
  postgresConnectivity: boolean
}): NodelizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const nodelizabilityPercent =
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
    nodelizabilityPercent,
  }
}

export function getNodelizabilityAdminGuidance(input: {
  stats: NodelizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect nodelizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial nodelizability coverage and refresh the nodelizability summary.'
  }

  if (input.stats.nodelizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan nodelizability below the 95% target and refresh the nodelizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace nodelizability coverage and refresh the nodelizability summary.'
}

export function resolveNodelizabilityAdminActions(): NodelizabilityAdminAction[] {
  return ['refresh_nodelizability_summary']
}
