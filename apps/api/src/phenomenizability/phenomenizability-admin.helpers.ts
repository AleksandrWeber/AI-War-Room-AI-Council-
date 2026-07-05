import type {
  PhenomenizabilityAdminAction,
  PhenomenizabilityAdminRecord,
  PhenomenizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePhenomenizabilityDomainInventory = {
  domain: PhenomenizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPhenomenizabilityAdminRecords(
  inventory: WorkspacePhenomenizabilityDomainInventory[],
): PhenomenizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPhenomenizabilityAdminStats(input: {
  records: PhenomenizabilityAdminRecord[]
  postgresConnectivity: boolean
}): PhenomenizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const phenomenizabilityPercent =
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
    phenomenizabilityPercent,
  }
}

export function getPhenomenizabilityAdminGuidance(input: {
  stats: PhenomenizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect phenomenizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial phenomenizability coverage and refresh the phenomenizability summary.'
  }

  if (input.stats.phenomenizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice phenomenizability below the 95% target and refresh the phenomenizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace phenomenizability coverage and refresh the phenomenizability summary.'
}

export function resolvePhenomenizabilityAdminActions(): PhenomenizabilityAdminAction[] {
  return ['refresh_phenomenizability_summary']
}
