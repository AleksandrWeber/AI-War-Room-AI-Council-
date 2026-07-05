import type {
  CatalogizabilityAdminAction,
  CatalogizabilityAdminRecord,
  CatalogizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCatalogizabilityDomainInventory = {
  domain: CatalogizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCatalogizabilityAdminRecords(
  inventory: WorkspaceCatalogizabilityDomainInventory[],
): CatalogizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCatalogizabilityAdminStats(input: {
  records: CatalogizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CatalogizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const catalogizabilityPercent =
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
    catalogizabilityPercent,
  }
}

export function getCatalogizabilityAdminGuidance(input: {
  stats: CatalogizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect catalogizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial catalogizability coverage and refresh the catalogizability summary.'
  }

  if (input.stats.catalogizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan catalogizability below the 95% target and refresh the catalogizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace catalogizability coverage and refresh the catalogizability summary.'
}

export function resolveCatalogizabilityAdminActions(): CatalogizabilityAdminAction[] {
  return ['refresh_catalogizability_summary']
}
