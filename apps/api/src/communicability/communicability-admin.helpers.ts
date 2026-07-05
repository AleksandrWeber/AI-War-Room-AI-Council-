import type {
  CommunicabilityAdminAction,
  CommunicabilityAdminRecord,
  CommunicabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCommunicabilityDomainInventory = {
  domain: CommunicabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCommunicabilityAdminRecords(
  inventory: WorkspaceCommunicabilityDomainInventory[],
): CommunicabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCommunicabilityAdminStats(input: {
  records: CommunicabilityAdminRecord[]
  postgresConnectivity: boolean
}): CommunicabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'moderator_syntheses')
      ?.recordCount ?? 0
  const communicabilityPercent =
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
    communicabilityPercent,
  }
}

export function getCommunicabilityAdminGuidance(input: {
  stats: CommunicabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect communicability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial communicability coverage and refresh the communicability summary.'
  }

  if (input.stats.communicabilityPercent < 95) {
    return 'Workspace owners and admins can inspect moderator synthesis communicability below the 95% target and refresh the communicability summary.'
  }

  return 'Workspace owners and admins can inspect workspace communicability coverage and refresh the communicability summary.'
}

export function resolveCommunicabilityAdminActions(): CommunicabilityAdminAction[] {
  return ['refresh_communicability_summary']
}
