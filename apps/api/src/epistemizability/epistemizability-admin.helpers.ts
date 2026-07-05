import type {
  EpistemizabilityAdminAction,
  EpistemizabilityAdminRecord,
  EpistemizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceEpistemizabilityDomainInventory = {
  domain: EpistemizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildEpistemizabilityAdminRecords(
  inventory: WorkspaceEpistemizabilityDomainInventory[],
): EpistemizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildEpistemizabilityAdminStats(input: {
  records: EpistemizabilityAdminRecord[]
  postgresConnectivity: boolean
}): EpistemizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const epistemizabilityPercent =
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
    epistemizabilityPercent,
  }
}

export function getEpistemizabilityAdminGuidance(input: {
  stats: EpistemizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect epistemizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial epistemizability coverage and refresh the epistemizability summary.'
  }

  if (input.stats.epistemizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan epistemizability below the 95% target and refresh the epistemizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace epistemizability coverage and refresh the epistemizability summary.'
}

export function resolveEpistemizabilityAdminActions(): EpistemizabilityAdminAction[] {
  return ['refresh_epistemizability_summary']
}
