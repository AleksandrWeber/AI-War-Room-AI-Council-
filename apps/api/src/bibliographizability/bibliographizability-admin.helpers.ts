import type {
  BibliographizabilityAdminAction,
  BibliographizabilityAdminRecord,
  BibliographizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceBibliographizabilityDomainInventory = {
  domain: BibliographizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildBibliographizabilityAdminRecords(
  inventory: WorkspaceBibliographizabilityDomainInventory[],
): BibliographizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildBibliographizabilityAdminStats(input: {
  records: BibliographizabilityAdminRecord[]
  postgresConnectivity: boolean
}): BibliographizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const bibliographizabilityPercent =
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
    bibliographizabilityPercent,
  }
}

export function getBibliographizabilityAdminGuidance(input: {
  stats: BibliographizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect bibliographizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial bibliographizability coverage and refresh the bibliographizability summary.'
  }

  if (input.stats.bibliographizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan bibliographizability below the 95% target and refresh the bibliographizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace bibliographizability coverage and refresh the bibliographizability summary.'
}

export function resolveBibliographizabilityAdminActions(): BibliographizabilityAdminAction[] {
  return ['refresh_bibliographizability_summary']
}
