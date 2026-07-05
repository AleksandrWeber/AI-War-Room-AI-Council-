import type {
  BroadcastizabilityAdminAction,
  BroadcastizabilityAdminRecord,
  BroadcastizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceBroadcastizabilityDomainInventory = {
  domain: BroadcastizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildBroadcastizabilityAdminRecords(
  inventory: WorkspaceBroadcastizabilityDomainInventory[],
): BroadcastizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildBroadcastizabilityAdminStats(input: {
  records: BroadcastizabilityAdminRecord[]
  postgresConnectivity: boolean
}): BroadcastizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const broadcastizabilityPercent =
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
    broadcastizabilityPercent,
  }
}

export function getBroadcastizabilityAdminGuidance(input: {
  stats: BroadcastizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect broadcastizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial broadcastizability coverage and refresh the broadcastizability summary.'
  }

  if (input.stats.broadcastizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice broadcastizability below the 95% target and refresh the broadcastizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace broadcastizability coverage and refresh the broadcastizability summary.'
}

export function resolveBroadcastizabilityAdminActions(): BroadcastizabilityAdminAction[] {
  return ['refresh_broadcastizability_summary']
}
