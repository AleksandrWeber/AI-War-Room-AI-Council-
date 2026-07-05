import type {
  UsabilityAdminAction,
  UsabilityAdminRecord,
  UsabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceUsabilityDomainInventory = {
  domain: UsabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildUsabilityAdminRecords(
  inventory: WorkspaceUsabilityDomainInventory[],
): UsabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildUsabilityAdminStats(input: {
  records: UsabilityAdminRecord[]
  postgresConnectivity: boolean
}): UsabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const usabilityPercent =
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
    usabilityPercent,
  }
}

export function getUsabilityAdminGuidance(input: {
  stats: UsabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect usability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial usability coverage and refresh the usability summary.'
  }

  if (input.stats.usabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership usability below the 95% target and refresh the usability summary.'
  }

  return 'Workspace owners and admins can inspect workspace usability coverage and refresh the usability summary.'
}

export function resolveUsabilityAdminActions(): UsabilityAdminAction[] {
  return ['refresh_usability_summary']
}
