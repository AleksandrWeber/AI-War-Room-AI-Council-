import type {
  DistinguishabilityAdminAction,
  DistinguishabilityAdminRecord,
  DistinguishabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDistinguishabilityDomainInventory = {
  domain: DistinguishabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDistinguishabilityAdminRecords(
  inventory: WorkspaceDistinguishabilityDomainInventory[],
): DistinguishabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDistinguishabilityAdminStats(input: {
  records: DistinguishabilityAdminRecord[]
  postgresConnectivity: boolean
}): DistinguishabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'moderator_syntheses')
      ?.recordCount ?? 0
  const distinguishabilityPercent =
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
    distinguishabilityPercent,
  }
}

export function getDistinguishabilityAdminGuidance(input: {
  stats: DistinguishabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect distinguishability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial distinguishability coverage and refresh the distinguishability summary.'
  }

  if (input.stats.distinguishabilityPercent < 95) {
    return 'Workspace owners and admins can inspect moderator synthesis distinguishability below the 95% target and refresh the distinguishability summary.'
  }

  return 'Workspace owners and admins can inspect workspace distinguishability coverage and refresh the distinguishability summary.'
}

export function resolveDistinguishabilityAdminActions(): DistinguishabilityAdminAction[] {
  return ['refresh_distinguishability_summary']
}
