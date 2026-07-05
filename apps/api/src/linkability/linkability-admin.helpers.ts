import type {
  LinkabilityAdminAction,
  LinkabilityAdminRecord,
  LinkabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceLinkabilityDomainInventory = {
  domain: LinkabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildLinkabilityAdminRecords(
  inventory: WorkspaceLinkabilityDomainInventory[],
): LinkabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildLinkabilityAdminStats(input: {
  records: LinkabilityAdminRecord[]
  postgresConnectivity: boolean
}): LinkabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'run_workflows')
      ?.recordCount ?? 0
  const linkabilityPercent =
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
    linkabilityPercent,
  }
}

export function getLinkabilityAdminGuidance(input: {
  stats: LinkabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect linkability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial linkability coverage and refresh the linkability summary.'
  }

  if (input.stats.linkabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workflow linkability below the 95% target and refresh the linkability summary.'
  }

  return 'Workspace owners and admins can inspect workspace linkability coverage and refresh the linkability summary.'
}

export function resolveLinkabilityAdminActions(): LinkabilityAdminAction[] {
  return ['refresh_linkability_summary']
}
