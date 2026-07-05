import type {
  PersistizabilityAdminAction,
  PersistizabilityAdminRecord,
  PersistizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePersistizabilityDomainInventory = {
  domain: PersistizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPersistizabilityAdminRecords(
  inventory: WorkspacePersistizabilityDomainInventory[],
): PersistizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPersistizabilityAdminStats(input: {
  records: PersistizabilityAdminRecord[]
  postgresConnectivity: boolean
}): PersistizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const persistizabilityPercent =
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
    persistizabilityPercent,
  }
}

export function getPersistizabilityAdminGuidance(input: {
  stats: PersistizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect persistizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial persistizability coverage and refresh the persistizability summary.'
  }

  if (input.stats.persistizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key persistizability below the 95% target and refresh the persistizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace persistizability coverage and refresh the persistizability summary.'
}

export function resolvePersistizabilityAdminActions(): PersistizabilityAdminAction[] {
  return ['refresh_persistizability_summary']
}
