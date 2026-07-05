import type {
  ProjectizabilityAdminAction,
  ProjectizabilityAdminRecord,
  ProjectizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceProjectizabilityDomainInventory = {
  domain: ProjectizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildProjectizabilityAdminRecords(
  inventory: WorkspaceProjectizabilityDomainInventory[],
): ProjectizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildProjectizabilityAdminStats(input: {
  records: ProjectizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ProjectizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const projectizabilityPercent =
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
    projectizabilityPercent,
  }
}

export function getProjectizabilityAdminGuidance(input: {
  stats: ProjectizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect projectizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial projectizability coverage and refresh the projectizability summary.'
  }

  if (input.stats.projectizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification projectizability below the 95% target and refresh the projectizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace projectizability coverage and refresh the projectizability summary.'
}

export function resolveProjectizabilityAdminActions(): ProjectizabilityAdminAction[] {
  return ['refresh_projectizability_summary']
}
