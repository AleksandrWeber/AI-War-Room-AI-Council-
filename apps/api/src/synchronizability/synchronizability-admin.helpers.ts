import type {
  SynchronizabilityAdminAction,
  SynchronizabilityAdminRecord,
  SynchronizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSynchronizabilityDomainInventory = {
  domain: SynchronizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSynchronizabilityAdminRecords(
  inventory: WorkspaceSynchronizabilityDomainInventory[],
): SynchronizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSynchronizabilityAdminStats(input: {
  records: SynchronizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SynchronizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const synchronizabilityPercent =
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
    synchronizabilityPercent,
  }
}

export function getSynchronizabilityAdminGuidance(input: {
  stats: SynchronizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect synchronizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial synchronizability coverage and refresh the synchronizability summary.'
  }

  if (input.stats.synchronizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key synchronizability below the 95% target and refresh the synchronizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace synchronizability coverage and refresh the synchronizability summary.'
}

export function resolveSynchronizabilityAdminActions(): SynchronizabilityAdminAction[] {
  return ['refresh_synchronizability_summary']
}
