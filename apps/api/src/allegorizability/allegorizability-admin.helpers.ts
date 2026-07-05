import type {
  AllegorizabilityAdminAction,
  AllegorizabilityAdminRecord,
  AllegorizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAllegorizabilityDomainInventory = {
  domain: AllegorizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAllegorizabilityAdminRecords(
  inventory: WorkspaceAllegorizabilityDomainInventory[],
): AllegorizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAllegorizabilityAdminStats(input: {
  records: AllegorizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AllegorizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const allegorizabilityPercent =
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
    allegorizabilityPercent,
  }
}

export function getAllegorizabilityAdminGuidance(input: {
  stats: AllegorizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect allegorizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial allegorizability coverage and refresh the allegorizability summary.'
  }

  if (input.stats.allegorizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key allegorizability below the 95% target and refresh the allegorizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace allegorizability coverage and refresh the allegorizability summary.'
}

export function resolveAllegorizabilityAdminActions(): AllegorizabilityAdminAction[] {
  return ['refresh_allegorizability_summary']
}
