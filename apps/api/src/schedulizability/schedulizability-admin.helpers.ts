import type {
  SchedulizabilityAdminAction,
  SchedulizabilityAdminRecord,
  SchedulizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSchedulizabilityDomainInventory = {
  domain: SchedulizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSchedulizabilityAdminRecords(
  inventory: WorkspaceSchedulizabilityDomainInventory[],
): SchedulizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSchedulizabilityAdminStats(input: {
  records: SchedulizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SchedulizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const schedulizabilityPercent =
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
    schedulizabilityPercent,
  }
}

export function getSchedulizabilityAdminGuidance(input: {
  stats: SchedulizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect schedulizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial schedulizability coverage and refresh the schedulizability summary.'
  }

  if (input.stats.schedulizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice schedulizability below the 95% target and refresh the schedulizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace schedulizability coverage and refresh the schedulizability summary.'
}

export function resolveSchedulizabilityAdminActions(): SchedulizabilityAdminAction[] {
  return ['refresh_schedulizability_summary']
}
