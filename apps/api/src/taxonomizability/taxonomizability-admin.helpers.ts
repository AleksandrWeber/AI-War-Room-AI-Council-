import type {
  TaxonomizabilityAdminAction,
  TaxonomizabilityAdminRecord,
  TaxonomizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTaxonomizabilityDomainInventory = {
  domain: TaxonomizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTaxonomizabilityAdminRecords(
  inventory: WorkspaceTaxonomizabilityDomainInventory[],
): TaxonomizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTaxonomizabilityAdminStats(input: {
  records: TaxonomizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TaxonomizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const taxonomizabilityPercent =
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
    taxonomizabilityPercent,
  }
}

export function getTaxonomizabilityAdminGuidance(input: {
  stats: TaxonomizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect taxonomizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial taxonomizability coverage and refresh the taxonomizability summary.'
  }

  if (input.stats.taxonomizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan taxonomizability below the 95% target and refresh the taxonomizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace taxonomizability coverage and refresh the taxonomizability summary.'
}

export function resolveTaxonomizabilityAdminActions(): TaxonomizabilityAdminAction[] {
  return ['refresh_taxonomizability_summary']
}
