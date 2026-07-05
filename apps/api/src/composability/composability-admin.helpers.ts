import type {
  ComposabilityAdminAction,
  ComposabilityAdminRecord,
  ComposabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceComposabilityDomainInventory = {
  domain: ComposabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildComposabilityAdminRecords(
  inventory: WorkspaceComposabilityDomainInventory[],
): ComposabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildComposabilityAdminStats(input: {
  records: ComposabilityAdminRecord[]
  postgresConnectivity: boolean
}): ComposabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'run_workflows')
      ?.recordCount ?? 0
  const composabilityPercent =
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
    composabilityPercent,
  }
}

export function getComposabilityAdminGuidance(input: {
  stats: ComposabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect composability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial composability coverage and refresh the composability summary.'
  }

  if (input.stats.composabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workflow composability below the 95% target and refresh the composability summary.'
  }

  return 'Workspace owners and admins can inspect workspace composability coverage and refresh the composability summary.'
}

export function resolveComposabilityAdminActions(): ComposabilityAdminAction[] {
  return ['refresh_composability_summary']
}
