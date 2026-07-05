import type {
  DirectoryizabilityAdminAction,
  DirectoryizabilityAdminRecord,
  DirectoryizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDirectoryizabilityDomainInventory = {
  domain: DirectoryizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDirectoryizabilityAdminRecords(
  inventory: WorkspaceDirectoryizabilityDomainInventory[],
): DirectoryizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDirectoryizabilityAdminStats(input: {
  records: DirectoryizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DirectoryizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const directoryizabilityPercent =
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
    directoryizabilityPercent,
  }
}

export function getDirectoryizabilityAdminGuidance(input: {
  stats: DirectoryizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect directoryizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial directoryizability coverage and refresh the directoryizability summary.'
  }

  if (input.stats.directoryizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership directoryizability below the 95% target and refresh the directoryizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace directoryizability coverage and refresh the directoryizability summary.'
}

export function resolveDirectoryizabilityAdminActions(): DirectoryizabilityAdminAction[] {
  return ['refresh_directoryizability_summary']
}
