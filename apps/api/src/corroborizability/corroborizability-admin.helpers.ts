import type {
  CorroborizabilityAdminAction,
  CorroborizabilityAdminRecord,
  CorroborizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCorroborizabilityDomainInventory = {
  domain: CorroborizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCorroborizabilityAdminRecords(
  inventory: WorkspaceCorroborizabilityDomainInventory[],
): CorroborizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCorroborizabilityAdminStats(input: {
  records: CorroborizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CorroborizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const corroborizabilityPercent =
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
    corroborizabilityPercent,
  }
}

export function getCorroborizabilityAdminGuidance(input: {
  stats: CorroborizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect corroborizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial corroborizability coverage and refresh the corroborizability summary.'
  }

  if (input.stats.corroborizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice corroborizability below the 95% target and refresh the corroborizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace corroborizability coverage and refresh the corroborizability summary.'
}

export function resolveCorroborizabilityAdminActions(): CorroborizabilityAdminAction[] {
  return ['refresh_corroborizability_summary']
}
