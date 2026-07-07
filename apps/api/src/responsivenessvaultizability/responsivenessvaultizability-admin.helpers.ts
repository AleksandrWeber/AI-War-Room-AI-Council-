import type {
  ResponsivenessvaultizabilityAdminAction,
  ResponsivenessvaultizabilityAdminRecord,
  ResponsivenessvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceResponsivenessvaultizabilityDomainInventory = {
  domain: ResponsivenessvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildResponsivenessvaultizabilityAdminRecords(
  inventory: WorkspaceResponsivenessvaultizabilityDomainInventory[],
): ResponsivenessvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildResponsivenessvaultizabilityAdminStats(input: {
  records: ResponsivenessvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ResponsivenessvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const responsivenessvaultizabilityPercent =
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
    responsivenessvaultizabilityPercent,
  }
}

export function getResponsivenessvaultizabilityAdminGuidance(input: {
  stats: ResponsivenessvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect responsivenessvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial responsivenessvaultizability coverage and refresh the responsivenessvaultizability summary.'
  }

  if (input.stats.responsivenessvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership responsivenessvaultizability below the 95% target and refresh the responsivenessvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace responsivenessvaultizability coverage and refresh the responsivenessvaultizability summary.'
}

export function resolveResponsivenessvaultizabilityAdminActions(): ResponsivenessvaultizabilityAdminAction[] {
  return ['refresh_responsivenessvaultizability_summary']
}
