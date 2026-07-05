import type {
  DescribabilityAdminAction,
  DescribabilityAdminRecord,
  DescribabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDescribabilityDomainInventory = {
  domain: DescribabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDescribabilityAdminRecords(
  inventory: WorkspaceDescribabilityDomainInventory[],
): DescribabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDescribabilityAdminStats(input: {
  records: DescribabilityAdminRecord[]
  postgresConnectivity: boolean
}): DescribabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'run_workflows')
      ?.recordCount ?? 0
  const describabilityPercent =
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
    describabilityPercent,
  }
}

export function getDescribabilityAdminGuidance(input: {
  stats: DescribabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect describability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial describability coverage and refresh the describability summary.'
  }

  if (input.stats.describabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workflow describability below the 95% target and refresh the describability summary.'
  }

  return 'Workspace owners and admins can inspect workspace describability coverage and refresh the describability summary.'
}

export function resolveDescribabilityAdminActions(): DescribabilityAdminAction[] {
  return ['refresh_describability_summary']
}
