import type {
  CitationizabilityAdminAction,
  CitationizabilityAdminRecord,
  CitationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCitationizabilityDomainInventory = {
  domain: CitationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCitationizabilityAdminRecords(
  inventory: WorkspaceCitationizabilityDomainInventory[],
): CitationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCitationizabilityAdminStats(input: {
  records: CitationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CitationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const citationizabilityPercent =
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
    citationizabilityPercent,
  }
}

export function getCitationizabilityAdminGuidance(input: {
  stats: CitationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect citationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial citationizability coverage and refresh the citationizability summary.'
  }

  if (input.stats.citationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification citationizability below the 95% target and refresh the citationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace citationizability coverage and refresh the citationizability summary.'
}

export function resolveCitationizabilityAdminActions(): CitationizabilityAdminAction[] {
  return ['refresh_citationizability_summary']
}
