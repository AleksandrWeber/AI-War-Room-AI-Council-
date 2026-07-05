import type {
  ExpandizabilityAdminAction,
  ExpandizabilityAdminRecord,
  ExpandizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceExpandizabilityDomainInventory = {
  domain: ExpandizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildExpandizabilityAdminRecords(
  inventory: WorkspaceExpandizabilityDomainInventory[],
): ExpandizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildExpandizabilityAdminStats(input: {
  records: ExpandizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ExpandizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const expandizabilityPercent =
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
    expandizabilityPercent,
  }
}

export function getExpandizabilityAdminGuidance(input: {
  stats: ExpandizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect expandizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial expandizability coverage and refresh the expandizability summary.'
  }

  if (input.stats.expandizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice expandizability below the 95% target and refresh the expandizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace expandizability coverage and refresh the expandizability summary.'
}

export function resolveExpandizabilityAdminActions(): ExpandizabilityAdminAction[] {
  return ['refresh_expandizability_summary']
}
