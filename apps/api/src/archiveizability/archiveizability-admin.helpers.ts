import type {
  ArchiveizabilityAdminAction,
  ArchiveizabilityAdminRecord,
  ArchiveizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceArchiveizabilityDomainInventory = {
  domain: ArchiveizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildArchiveizabilityAdminRecords(
  inventory: WorkspaceArchiveizabilityDomainInventory[],
): ArchiveizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildArchiveizabilityAdminStats(input: {
  records: ArchiveizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ArchiveizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const archiveizabilityPercent =
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
    archiveizabilityPercent,
  }
}

export function getArchiveizabilityAdminGuidance(input: {
  stats: ArchiveizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect archiveizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial archiveizability coverage and refresh the archiveizability summary.'
  }

  if (input.stats.archiveizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification archiveizability below the 95% target and refresh the archiveizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace archiveizability coverage and refresh the archiveizability summary.'
}

export function resolveArchiveizabilityAdminActions(): ArchiveizabilityAdminAction[] {
  return ['refresh_archiveizability_summary']
}
