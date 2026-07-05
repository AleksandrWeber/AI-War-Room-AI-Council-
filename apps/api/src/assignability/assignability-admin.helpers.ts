import type {
  AssignabilityAdminAction,
  AssignabilityAdminRecord,
  AssignabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAssignabilityDomainInventory = {
  domain: AssignabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAssignabilityAdminRecords(
  inventory: WorkspaceAssignabilityDomainInventory[],
): AssignabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAssignabilityAdminStats(input: {
  records: AssignabilityAdminRecord[]
  postgresConnectivity: boolean
}): AssignabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const assignabilityPercent =
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
    assignabilityPercent,
  }
}

export function getAssignabilityAdminGuidance(input: {
  stats: AssignabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect assignability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial assignability coverage and refresh the assignability summary.'
  }

  if (input.stats.assignabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace membership assignability below the 95% target and refresh the assignability summary.'
  }

  return 'Workspace owners and admins can inspect workspace assignability coverage and refresh the assignability summary.'
}

export function resolveAssignabilityAdminActions(): AssignabilityAdminAction[] {
  return ['refresh_assignability_summary']
}
