import type {
  IllustratabilityAdminAction,
  IllustratabilityAdminRecord,
  IllustratabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceIllustratabilityDomainInventory = {
  domain: IllustratabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildIllustratabilityAdminRecords(
  inventory: WorkspaceIllustratabilityDomainInventory[],
): IllustratabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildIllustratabilityAdminStats(input: {
  records: IllustratabilityAdminRecord[]
  postgresConnectivity: boolean
}): IllustratabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const illustratabilityPercent =
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
    illustratabilityPercent,
  }
}

export function getIllustratabilityAdminGuidance(input: {
  stats: IllustratabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect illustratability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial illustratability coverage and refresh the illustratability summary.'
  }

  if (input.stats.illustratabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan illustratability below the 95% target and refresh the illustratability summary.'
  }

  return 'Workspace owners and admins can inspect workspace illustratability coverage and refresh the illustratability summary.'
}

export function resolveIllustratabilityAdminActions(): IllustratabilityAdminAction[] {
  return ['refresh_illustratability_summary']
}
