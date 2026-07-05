import type {
  ExportizabilityAdminAction,
  ExportizabilityAdminRecord,
  ExportizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceExportizabilityDomainInventory = {
  domain: ExportizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildExportizabilityAdminRecords(
  inventory: WorkspaceExportizabilityDomainInventory[],
): ExportizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildExportizabilityAdminStats(input: {
  records: ExportizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ExportizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const exportizabilityPercent =
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
    exportizabilityPercent,
  }
}

export function getExportizabilityAdminGuidance(input: {
  stats: ExportizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect exportizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial exportizability coverage and refresh the exportizability summary.'
  }

  if (input.stats.exportizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit exportizability below the 95% target and refresh the exportizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace exportizability coverage and refresh the exportizability summary.'
}

export function resolveExportizabilityAdminActions(): ExportizabilityAdminAction[] {
  return ['refresh_exportizability_summary']
}
