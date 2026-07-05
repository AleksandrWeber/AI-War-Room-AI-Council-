import type {
  AckizabilityAdminAction,
  AckizabilityAdminRecord,
  AckizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAckizabilityDomainInventory = {
  domain: AckizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAckizabilityAdminRecords(
  inventory: WorkspaceAckizabilityDomainInventory[],
): AckizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAckizabilityAdminStats(input: {
  records: AckizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AckizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const ackizabilityPercent =
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
    ackizabilityPercent,
  }
}

export function getAckizabilityAdminGuidance(input: {
  stats: AckizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect ackizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial ackizability coverage and refresh the ackizability summary.'
  }

  if (input.stats.ackizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook ackizability below the 95% target and refresh the ackizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace ackizability coverage and refresh the ackizability summary.'
}

export function resolveAckizabilityAdminActions(): AckizabilityAdminAction[] {
  return ['refresh_ackizability_summary']
}
