import type {
  AccreditationizabilityAdminAction,
  AccreditationizabilityAdminRecord,
  AccreditationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAccreditationizabilityDomainInventory = {
  domain: AccreditationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAccreditationizabilityAdminRecords(
  inventory: WorkspaceAccreditationizabilityDomainInventory[],
): AccreditationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAccreditationizabilityAdminStats(input: {
  records: AccreditationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AccreditationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const accreditationizabilityPercent =
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
    accreditationizabilityPercent,
  }
}

export function getAccreditationizabilityAdminGuidance(input: {
  stats: AccreditationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect accreditationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial accreditationizability coverage and refresh the accreditationizability summary.'
  }

  if (input.stats.accreditationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership accreditationizability below the 95% target and refresh the accreditationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace accreditationizability coverage and refresh the accreditationizability summary.'
}

export function resolveAccreditationizabilityAdminActions(): AccreditationizabilityAdminAction[] {
  return ['refresh_accreditationizability_summary']
}
