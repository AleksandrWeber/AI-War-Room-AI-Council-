import type {
  JournalizabilityAdminAction,
  JournalizabilityAdminRecord,
  JournalizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceJournalizabilityDomainInventory = {
  domain: JournalizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildJournalizabilityAdminRecords(
  inventory: WorkspaceJournalizabilityDomainInventory[],
): JournalizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildJournalizabilityAdminStats(input: {
  records: JournalizabilityAdminRecord[]
  postgresConnectivity: boolean
}): JournalizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const journalizabilityPercent =
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
    journalizabilityPercent,
  }
}

export function getJournalizabilityAdminGuidance(input: {
  stats: JournalizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect journalizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial journalizability coverage and refresh the journalizability summary.'
  }

  if (input.stats.journalizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership journalizability below the 95% target and refresh the journalizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace journalizability coverage and refresh the journalizability summary.'
}

export function resolveJournalizabilityAdminActions(): JournalizabilityAdminAction[] {
  return ['refresh_journalizability_summary']
}
