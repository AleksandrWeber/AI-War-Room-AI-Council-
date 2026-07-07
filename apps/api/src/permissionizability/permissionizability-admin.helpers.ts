import type {
  PermissionizabilityAdminAction,
  PermissionizabilityAdminRecord,
  PermissionizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePermissionizabilityDomainInventory = {
  domain: PermissionizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPermissionizabilityAdminRecords(
  inventory: WorkspacePermissionizabilityDomainInventory[],
): PermissionizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPermissionizabilityAdminStats(input: {
  records: PermissionizabilityAdminRecord[]
  postgresConnectivity: boolean
}): PermissionizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const permissionizabilityPercent =
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
    permissionizabilityPercent,
  }
}

export function getPermissionizabilityAdminGuidance(input: {
  stats: PermissionizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect permissionizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial permissionizability coverage and refresh the permissionizability summary.'
  }

  if (input.stats.permissionizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership permissionizability below the 95% target and refresh the permissionizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace permissionizability coverage and refresh the permissionizability summary.'
}

export function resolvePermissionizabilityAdminActions(): PermissionizabilityAdminAction[] {
  return ['refresh_permissionizability_summary']
}
