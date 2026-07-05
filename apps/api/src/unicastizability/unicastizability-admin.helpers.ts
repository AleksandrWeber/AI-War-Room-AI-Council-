import type {
  UnicastizabilityAdminAction,
  UnicastizabilityAdminRecord,
  UnicastizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceUnicastizabilityDomainInventory = {
  domain: UnicastizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildUnicastizabilityAdminRecords(
  inventory: WorkspaceUnicastizabilityDomainInventory[],
): UnicastizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildUnicastizabilityAdminStats(input: {
  records: UnicastizabilityAdminRecord[]
  postgresConnectivity: boolean
}): UnicastizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const unicastizabilityPercent =
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
    unicastizabilityPercent,
  }
}

export function getUnicastizabilityAdminGuidance(input: {
  stats: UnicastizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect unicastizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial unicastizability coverage and refresh the unicastizability summary.'
  }

  if (input.stats.unicastizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook unicastizability below the 95% target and refresh the unicastizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace unicastizability coverage and refresh the unicastizability summary.'
}

export function resolveUnicastizabilityAdminActions(): UnicastizabilityAdminAction[] {
  return ['refresh_unicastizability_summary']
}
