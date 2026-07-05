import type {
  ComposabilizabilityAdminAction,
  ComposabilizabilityAdminRecord,
  ComposabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceComposabilizabilityDomainInventory = {
  domain: ComposabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildComposabilizabilityAdminRecords(
  inventory: WorkspaceComposabilizabilityDomainInventory[],
): ComposabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildComposabilizabilityAdminStats(input: {
  records: ComposabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ComposabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const composabilizabilityPercent =
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
    composabilizabilityPercent,
  }
}

export function getComposabilizabilityAdminGuidance(input: {
  stats: ComposabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect composabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial composabilizability coverage and refresh the composabilizability summary.'
  }

  if (input.stats.composabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key composabilizability below the 95% target and refresh the composabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace composabilizability coverage and refresh the composabilizability summary.'
}

export function resolveComposabilizabilityAdminActions(): ComposabilizabilityAdminAction[] {
  return ['refresh_composabilizability_summary']
}
