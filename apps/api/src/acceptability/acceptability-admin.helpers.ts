import type {
  AcceptabilityAdminAction,
  AcceptabilityAdminRecord,
  AcceptabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAcceptabilityDomainInventory = {
  domain: AcceptabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAcceptabilityAdminRecords(
  inventory: WorkspaceAcceptabilityDomainInventory[],
): AcceptabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAcceptabilityAdminStats(input: {
  records: AcceptabilityAdminRecord[]
  postgresConnectivity: boolean
}): AcceptabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_records')
      ?.recordCount ?? 0
  const acceptabilityPercent =
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
    acceptabilityPercent,
  }
}

export function getAcceptabilityAdminGuidance(input: {
  stats: AcceptabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect acceptability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial acceptability coverage and refresh the acceptability summary.'
  }

  if (input.stats.acceptabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing record acceptability below the 95% target and refresh the acceptability summary.'
  }

  return 'Workspace owners and admins can inspect workspace acceptability coverage and refresh the acceptability summary.'
}

export function resolveAcceptabilityAdminActions(): AcceptabilityAdminAction[] {
  return ['refresh_acceptability_summary']
}
