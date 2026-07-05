import type {
  HistorizabilityAdminAction,
  HistorizabilityAdminRecord,
  HistorizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceHistorizabilityDomainInventory = {
  domain: HistorizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildHistorizabilityAdminRecords(
  inventory: WorkspaceHistorizabilityDomainInventory[],
): HistorizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildHistorizabilityAdminStats(input: {
  records: HistorizabilityAdminRecord[]
  postgresConnectivity: boolean
}): HistorizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const historizabilityPercent =
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
    historizabilityPercent,
  }
}

export function getHistorizabilityAdminGuidance(input: {
  stats: HistorizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect historizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial historizability coverage and refresh the historizability summary.'
  }

  if (input.stats.historizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential historizability below the 95% target and refresh the historizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace historizability coverage and refresh the historizability summary.'
}

export function resolveHistorizabilityAdminActions(): HistorizabilityAdminAction[] {
  return ['refresh_historizability_summary']
}
