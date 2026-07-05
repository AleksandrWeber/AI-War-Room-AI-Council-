import type {
  LearnabilityAdminAction,
  LearnabilityAdminRecord,
  LearnabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceLearnabilityDomainInventory = {
  domain: LearnabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildLearnabilityAdminRecords(
  inventory: WorkspaceLearnabilityDomainInventory[],
): LearnabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildLearnabilityAdminStats(input: {
  records: LearnabilityAdminRecord[]
  postgresConnectivity: boolean
}): LearnabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'agent_outputs')
      ?.recordCount ?? 0
  const learnabilityPercent =
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
    learnabilityPercent,
  }
}

export function getLearnabilityAdminGuidance(input: {
  stats: LearnabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect learnability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial learnability coverage and refresh the learnability summary.'
  }

  if (input.stats.learnabilityPercent < 95) {
    return 'Workspace owners and admins can inspect agent output learnability below the 95% target and refresh the learnability summary.'
  }

  return 'Workspace owners and admins can inspect workspace learnability coverage and refresh the learnability summary.'
}

export function resolveLearnabilityAdminActions(): LearnabilityAdminAction[] {
  return ['refresh_learnability_summary']
}
