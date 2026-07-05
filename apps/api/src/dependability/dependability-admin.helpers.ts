import type {
  DependabilityAdminAction,
  DependabilityAdminRecord,
  DependabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDependabilityDomainInventory = {
  domain: DependabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDependabilityAdminRecords(
  inventory: WorkspaceDependabilityDomainInventory[],
): DependabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDependabilityAdminStats(input: {
  records: DependabilityAdminRecord[]
  postgresConnectivity: boolean
}): DependabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_records')
      ?.recordCount ?? 0
  const dependabilityPercent =
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
    dependabilityPercent,
  }
}

export function getDependabilityAdminGuidance(input: {
  stats: DependabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect dependability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial dependability coverage and refresh the dependability summary.'
  }

  if (input.stats.dependabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing record dependability below the 95% target and refresh the dependability summary.'
  }

  return 'Workspace owners and admins can inspect workspace dependability coverage and refresh the dependability summary.'
}

export function resolveDependabilityAdminActions(): DependabilityAdminAction[] {
  return ['refresh_dependability_summary']
}
