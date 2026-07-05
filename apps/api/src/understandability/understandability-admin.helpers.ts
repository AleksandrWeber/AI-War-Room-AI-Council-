import type {
  UnderstandabilityAdminAction,
  UnderstandabilityAdminRecord,
  UnderstandabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceUnderstandabilityDomainInventory = {
  domain: UnderstandabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildUnderstandabilityAdminRecords(
  inventory: WorkspaceUnderstandabilityDomainInventory[],
): UnderstandabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildUnderstandabilityAdminStats(input: {
  records: UnderstandabilityAdminRecord[]
  postgresConnectivity: boolean
}): UnderstandabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'moderator_syntheses')
      ?.recordCount ?? 0
  const understandabilityPercent =
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
    understandabilityPercent,
  }
}

export function getUnderstandabilityAdminGuidance(input: {
  stats: UnderstandabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect understandability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial understandability coverage and refresh the understandability summary.'
  }

  if (input.stats.understandabilityPercent < 95) {
    return 'Workspace owners and admins can inspect moderator synthesis understandability below the 95% target and refresh the understandability summary.'
  }

  return 'Workspace owners and admins can inspect workspace understandability coverage and refresh the understandability summary.'
}

export function resolveUnderstandabilityAdminActions(): UnderstandabilityAdminAction[] {
  return ['refresh_understandability_summary']
}
