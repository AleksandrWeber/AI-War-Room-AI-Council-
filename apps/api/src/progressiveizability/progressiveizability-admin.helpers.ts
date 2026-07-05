import type {
  ProgressiveizabilityAdminAction,
  ProgressiveizabilityAdminRecord,
  ProgressiveizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceProgressiveizabilityDomainInventory = {
  domain: ProgressiveizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildProgressiveizabilityAdminRecords(
  inventory: WorkspaceProgressiveizabilityDomainInventory[],
): ProgressiveizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildProgressiveizabilityAdminStats(input: {
  records: ProgressiveizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ProgressiveizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const progressiveizabilityPercent =
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
    progressiveizabilityPercent,
  }
}

export function getProgressiveizabilityAdminGuidance(input: {
  stats: ProgressiveizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect progressiveizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial progressiveizability coverage and refresh the progressiveizability summary.'
  }

  if (input.stats.progressiveizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential progressiveizability below the 95% target and refresh the progressiveizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace progressiveizability coverage and refresh the progressiveizability summary.'
}

export function resolveProgressiveizabilityAdminActions(): ProgressiveizabilityAdminAction[] {
  return ['refresh_progressiveizability_summary']
}
