import type {
  OversightAdminAction,
  OversightAdminRecord,
  OversightAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceOversightDomainInventory = {
  domain: OversightAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildOversightAdminRecords(
  inventory: WorkspaceOversightDomainInventory[],
): OversightAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildOversightAdminStats(input: {
  records: OversightAdminRecord[]
  postgresConnectivity: boolean
}): OversightAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const billingWebhookEvents =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const oversightPercent =
    completedRuns === 0
      ? 100
      : Math.min(100, Math.round((billingWebhookEvents / completedRuns) * 100))

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    oversightPercent,
  }
}

export function getOversightAdminGuidance(input: {
  stats: OversightAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect oversight metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial oversight coverage and refresh the oversight summary.'
  }

  if (input.stats.oversightPercent < 95) {
    return 'Workspace owners and admins can inspect billing oversight below the 95% target and refresh the oversight summary.'
  }

  return 'Workspace owners and admins can inspect workspace oversight coverage and refresh the oversight summary.'
}

export function resolveOversightAdminActions(): OversightAdminAction[] {
  return ['refresh_oversight_summary']
}
