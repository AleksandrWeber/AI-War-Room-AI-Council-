import type {
  VersionizabilityAdminAction,
  VersionizabilityAdminRecord,
  VersionizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceVersionizabilityDomainInventory = {
  domain: VersionizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildVersionizabilityAdminRecords(
  inventory: WorkspaceVersionizabilityDomainInventory[],
): VersionizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildVersionizabilityAdminStats(input: {
  records: VersionizabilityAdminRecord[]
  postgresConnectivity: boolean
}): VersionizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const versionizabilityPercent =
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
    versionizabilityPercent,
  }
}

export function getVersionizabilityAdminGuidance(input: {
  stats: VersionizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect versionizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial versionizability coverage and refresh the versionizability summary.'
  }

  if (input.stats.versionizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage versionizability below the 95% target and refresh the versionizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace versionizability coverage and refresh the versionizability summary.'
}

export function resolveVersionizabilityAdminActions(): VersionizabilityAdminAction[] {
  return ['refresh_versionizability_summary']
}
