import type {
  AppendizabilityAdminAction,
  AppendizabilityAdminRecord,
  AppendizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAppendizabilityDomainInventory = {
  domain: AppendizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAppendizabilityAdminRecords(
  inventory: WorkspaceAppendizabilityDomainInventory[],
): AppendizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAppendizabilityAdminStats(input: {
  records: AppendizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AppendizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const appendizabilityPercent =
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
    appendizabilityPercent,
  }
}

export function getAppendizabilityAdminGuidance(input: {
  stats: AppendizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect appendizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial appendizability coverage and refresh the appendizability summary.'
  }

  if (input.stats.appendizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice appendizability below the 95% target and refresh the appendizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace appendizability coverage and refresh the appendizability summary.'
}

export function resolveAppendizabilityAdminActions(): AppendizabilityAdminAction[] {
  return ['refresh_appendizability_summary']
}
