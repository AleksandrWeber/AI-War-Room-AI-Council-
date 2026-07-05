import type {
  JoinizabilityAdminAction,
  JoinizabilityAdminRecord,
  JoinizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceJoinizabilityDomainInventory = {
  domain: JoinizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildJoinizabilityAdminRecords(
  inventory: WorkspaceJoinizabilityDomainInventory[],
): JoinizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildJoinizabilityAdminStats(input: {
  records: JoinizabilityAdminRecord[]
  postgresConnectivity: boolean
}): JoinizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const joinizabilityPercent =
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
    joinizabilityPercent,
  }
}

export function getJoinizabilityAdminGuidance(input: {
  stats: JoinizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect joinizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial joinizability coverage and refresh the joinizability summary.'
  }

  if (input.stats.joinizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key joinizability below the 95% target and refresh the joinizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace joinizability coverage and refresh the joinizability summary.'
}

export function resolveJoinizabilityAdminActions(): JoinizabilityAdminAction[] {
  return ['refresh_joinizability_summary']
}
