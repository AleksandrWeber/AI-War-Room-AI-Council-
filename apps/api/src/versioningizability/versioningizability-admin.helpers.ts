import type {
  VersioningizabilityAdminAction,
  VersioningizabilityAdminRecord,
  VersioningizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceVersioningizabilityDomainInventory = {
  domain: VersioningizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildVersioningizabilityAdminRecords(
  inventory: WorkspaceVersioningizabilityDomainInventory[],
): VersioningizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildVersioningizabilityAdminStats(input: {
  records: VersioningizabilityAdminRecord[]
  postgresConnectivity: boolean
}): VersioningizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const versioningizabilityPercent =
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
    versioningizabilityPercent,
  }
}

export function getVersioningizabilityAdminGuidance(input: {
  stats: VersioningizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect versioningizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial versioningizability coverage and refresh the versioningizability summary.'
  }

  if (input.stats.versioningizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key versioningizability below the 95% target and refresh the versioningizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace versioningizability coverage and refresh the versioningizability summary.'
}

export function resolveVersioningizabilityAdminActions(): VersioningizabilityAdminAction[] {
  return ['refresh_versioningizability_summary']
}
