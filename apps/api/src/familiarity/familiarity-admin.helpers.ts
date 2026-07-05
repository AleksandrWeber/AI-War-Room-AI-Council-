import type {
  FamiliarityAdminAction,
  FamiliarityAdminRecord,
  FamiliarityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceFamiliarityDomainInventory = {
  domain: FamiliarityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildFamiliarityAdminRecords(
  inventory: WorkspaceFamiliarityDomainInventory[],
): FamiliarityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildFamiliarityAdminStats(input: {
  records: FamiliarityAdminRecord[]
  postgresConnectivity: boolean
}): FamiliarityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const familiarityPercent =
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
    familiarityPercent,
  }
}

export function getFamiliarityAdminGuidance(input: {
  stats: FamiliarityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect familiarity metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial familiarity coverage and refresh the familiarity summary.'
  }

  if (input.stats.familiarityPercent < 95) {
    return 'Workspace owners and admins can inspect membership familiarity below the 95% target and refresh the familiarity summary.'
  }

  return 'Workspace owners and admins can inspect workspace familiarity coverage and refresh the familiarity summary.'
}

export function resolveFamiliarityAdminActions(): FamiliarityAdminAction[] {
  return ['refresh_familiarity_summary']
}
