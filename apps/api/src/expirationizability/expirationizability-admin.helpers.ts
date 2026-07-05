import type {
  ExpirationizabilityAdminAction,
  ExpirationizabilityAdminRecord,
  ExpirationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceExpirationizabilityDomainInventory = {
  domain: ExpirationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildExpirationizabilityAdminRecords(
  inventory: WorkspaceExpirationizabilityDomainInventory[],
): ExpirationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildExpirationizabilityAdminStats(input: {
  records: ExpirationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ExpirationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const expirationizabilityPercent =
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
    expirationizabilityPercent,
  }
}

export function getExpirationizabilityAdminGuidance(input: {
  stats: ExpirationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect expirationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial expirationizability coverage and refresh the expirationizability summary.'
  }

  if (input.stats.expirationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification expirationizability below the 95% target and refresh the expirationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace expirationizability coverage and refresh the expirationizability summary.'
}

export function resolveExpirationizabilityAdminActions(): ExpirationizabilityAdminAction[] {
  return ['refresh_expirationizability_summary']
}
