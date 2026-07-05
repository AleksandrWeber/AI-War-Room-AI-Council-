import type {
  DependableizabilityAdminAction,
  DependableizabilityAdminRecord,
  DependableizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDependableizabilityDomainInventory = {
  domain: DependableizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDependableizabilityAdminRecords(
  inventory: WorkspaceDependableizabilityDomainInventory[],
): DependableizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDependableizabilityAdminStats(input: {
  records: DependableizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DependableizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const dependableizabilityPercent =
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
    dependableizabilityPercent,
  }
}

export function getDependableizabilityAdminGuidance(input: {
  stats: DependableizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect dependableizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial dependableizability coverage and refresh the dependableizability summary.'
  }

  if (input.stats.dependableizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification dependableizability below the 95% target and refresh the dependableizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace dependableizability coverage and refresh the dependableizability summary.'
}

export function resolveDependableizabilityAdminActions(): DependableizabilityAdminAction[] {
  return ['refresh_dependableizability_summary']
}
