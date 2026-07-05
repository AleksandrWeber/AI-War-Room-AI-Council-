import type {
  SnapshotizabilityAdminAction,
  SnapshotizabilityAdminRecord,
  SnapshotizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSnapshotizabilityDomainInventory = {
  domain: SnapshotizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSnapshotizabilityAdminRecords(
  inventory: WorkspaceSnapshotizabilityDomainInventory[],
): SnapshotizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSnapshotizabilityAdminStats(input: {
  records: SnapshotizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SnapshotizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const snapshotizabilityPercent =
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
    snapshotizabilityPercent,
  }
}

export function getSnapshotizabilityAdminGuidance(input: {
  stats: SnapshotizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect snapshotizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial snapshotizability coverage and refresh the snapshotizability summary.'
  }

  if (input.stats.snapshotizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key snapshotizability below the 95% target and refresh the snapshotizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace snapshotizability coverage and refresh the snapshotizability summary.'
}

export function resolveSnapshotizabilityAdminActions(): SnapshotizabilityAdminAction[] {
  return ['refresh_snapshotizability_summary']
}
