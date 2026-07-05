import type {
  ReleaseAdminAction,
  ReleaseAdminRecord,
  ReleaseAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceReleaseDomainInventory = {
  domain: ReleaseAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildReleaseAdminRecords(
  inventory: WorkspaceReleaseDomainInventory[],
): ReleaseAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildReleaseAdminStats(input: {
  records: ReleaseAdminRecord[]
  postgresConnectivity: boolean
  apiVersion: string
}): ReleaseAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    apiVersion: input.apiVersion,
  }
}

export function getReleaseAdminGuidance(input: { stats: ReleaseAdminStats }) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect release metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial release coverage and refresh the release summary.'
  }

  return 'Workspace owners and admins can inspect workspace release coverage and refresh the release summary.'
}

export function resolveReleaseAdminActions(): ReleaseAdminAction[] {
  return ['refresh_release_summary']
}
