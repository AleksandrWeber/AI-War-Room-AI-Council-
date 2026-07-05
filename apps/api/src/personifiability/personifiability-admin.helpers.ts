import type {
  PersonifiabilityAdminAction,
  PersonifiabilityAdminRecord,
  PersonifiabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePersonifiabilityDomainInventory = {
  domain: PersonifiabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPersonifiabilityAdminRecords(
  inventory: WorkspacePersonifiabilityDomainInventory[],
): PersonifiabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPersonifiabilityAdminStats(input: {
  records: PersonifiabilityAdminRecord[]
  postgresConnectivity: boolean
}): PersonifiabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'agent_outputs')
      ?.recordCount ?? 0
  const personifiabilityPercent =
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
    personifiabilityPercent,
  }
}

export function getPersonifiabilityAdminGuidance(input: {
  stats: PersonifiabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect personifiability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial personifiability coverage and refresh the personifiability summary.'
  }

  if (input.stats.personifiabilityPercent < 95) {
    return 'Workspace owners and admins can inspect agent output personifiability below the 95% target and refresh the personifiability summary.'
  }

  return 'Workspace owners and admins can inspect workspace personifiability coverage and refresh the personifiability summary.'
}

export function resolvePersonifiabilityAdminActions(): PersonifiabilityAdminAction[] {
  return ['refresh_personifiability_summary']
}
