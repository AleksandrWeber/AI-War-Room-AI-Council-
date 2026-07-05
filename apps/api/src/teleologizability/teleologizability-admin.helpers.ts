import type {
  TeleologizabilityAdminAction,
  TeleologizabilityAdminRecord,
  TeleologizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTeleologizabilityDomainInventory = {
  domain: TeleologizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTeleologizabilityAdminRecords(
  inventory: WorkspaceTeleologizabilityDomainInventory[],
): TeleologizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTeleologizabilityAdminStats(input: {
  records: TeleologizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TeleologizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const teleologizabilityPercent =
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
    teleologizabilityPercent,
  }
}

export function getTeleologizabilityAdminGuidance(input: {
  stats: TeleologizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect teleologizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial teleologizability coverage and refresh the teleologizability summary.'
  }

  if (input.stats.teleologizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook teleologizability below the 95% target and refresh the teleologizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace teleologizability coverage and refresh the teleologizability summary.'
}

export function resolveTeleologizabilityAdminActions(): TeleologizabilityAdminAction[] {
  return ['refresh_teleologizability_summary']
}
