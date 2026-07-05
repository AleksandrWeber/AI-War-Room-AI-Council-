import type {
  NarratabilityAdminAction,
  NarratabilityAdminRecord,
  NarratabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceNarratabilityDomainInventory = {
  domain: NarratabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildNarratabilityAdminRecords(
  inventory: WorkspaceNarratabilityDomainInventory[],
): NarratabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildNarratabilityAdminStats(input: {
  records: NarratabilityAdminRecord[]
  postgresConnectivity: boolean
}): NarratabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const narratabilityPercent =
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
    narratabilityPercent,
  }
}

export function getNarratabilityAdminGuidance(input: {
  stats: NarratabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect narratability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial narratability coverage and refresh the narratability summary.'
  }

  if (input.stats.narratabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership narratability below the 95% target and refresh the narratability summary.'
  }

  return 'Workspace owners and admins can inspect workspace narratability coverage and refresh the narratability summary.'
}

export function resolveNarratabilityAdminActions(): NarratabilityAdminAction[] {
  return ['refresh_narratability_summary']
}
