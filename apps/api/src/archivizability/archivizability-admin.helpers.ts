import type {
  ArchivizabilityAdminAction,
  ArchivizabilityAdminRecord,
  ArchivizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceArchivizabilityDomainInventory = {
  domain: ArchivizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildArchivizabilityAdminRecords(
  inventory: WorkspaceArchivizabilityDomainInventory[],
): ArchivizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildArchivizabilityAdminStats(input: {
  records: ArchivizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ArchivizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const archivizabilityPercent =
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
    archivizabilityPercent,
  }
}

export function getArchivizabilityAdminGuidance(input: {
  stats: ArchivizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect archivizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial archivizability coverage and refresh the archivizability summary.'
  }

  if (input.stats.archivizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook archivizability below the 95% target and refresh the archivizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace archivizability coverage and refresh the archivizability summary.'
}

export function resolveArchivizabilityAdminActions(): ArchivizabilityAdminAction[] {
  return ['refresh_archivizability_summary']
}
