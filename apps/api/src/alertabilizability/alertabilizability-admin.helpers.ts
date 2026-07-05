import type {
  AlertabilizabilityAdminAction,
  AlertabilizabilityAdminRecord,
  AlertabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAlertabilizabilityDomainInventory = {
  domain: AlertabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAlertabilizabilityAdminRecords(
  inventory: WorkspaceAlertabilizabilityDomainInventory[],
): AlertabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAlertabilizabilityAdminStats(input: {
  records: AlertabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AlertabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const alertabilizabilityPercent =
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
    alertabilizabilityPercent,
  }
}

export function getAlertabilizabilityAdminGuidance(input: {
  stats: AlertabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect alertabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial alertabilizability coverage and refresh the alertabilizability summary.'
  }

  if (input.stats.alertabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice alertabilizability below the 95% target and refresh the alertabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace alertabilizability coverage and refresh the alertabilizability summary.'
}

export function resolveAlertabilizabilityAdminActions(): AlertabilizabilityAdminAction[] {
  return ['refresh_alertabilizability_summary']
}
