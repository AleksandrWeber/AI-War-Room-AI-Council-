import type {
  ArticulabilityAdminAction,
  ArticulabilityAdminRecord,
  ArticulabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceArticulabilityDomainInventory = {
  domain: ArticulabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildArticulabilityAdminRecords(
  inventory: WorkspaceArticulabilityDomainInventory[],
): ArticulabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildArticulabilityAdminStats(input: {
  records: ArticulabilityAdminRecord[]
  postgresConnectivity: boolean
}): ArticulabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'artifacts')
      ?.recordCount ?? 0
  const articulabilityPercent =
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
    articulabilityPercent,
  }
}

export function getArticulabilityAdminGuidance(input: {
  stats: ArticulabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect articulability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial articulability coverage and refresh the articulability summary.'
  }

  if (input.stats.articulabilityPercent < 95) {
    return 'Workspace owners and admins can inspect artifact articulability below the 95% target and refresh the articulability summary.'
  }

  return 'Workspace owners and admins can inspect workspace articulability coverage and refresh the articulability summary.'
}

export function resolveArticulabilityAdminActions(): ArticulabilityAdminAction[] {
  return ['refresh_articulability_summary']
}
