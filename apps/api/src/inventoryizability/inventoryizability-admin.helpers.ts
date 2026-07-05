import type {
  InventoryizabilityAdminAction,
  InventoryizabilityAdminRecord,
  InventoryizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceInventoryizabilityDomainInventory = {
  domain: InventoryizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildInventoryizabilityAdminRecords(
  inventory: WorkspaceInventoryizabilityDomainInventory[],
): InventoryizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildInventoryizabilityAdminStats(input: {
  records: InventoryizabilityAdminRecord[]
  postgresConnectivity: boolean
}): InventoryizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const inventoryizabilityPercent =
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
    inventoryizabilityPercent,
  }
}

export function getInventoryizabilityAdminGuidance(input: {
  stats: InventoryizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect inventoryizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial inventoryizability coverage and refresh the inventoryizability summary.'
  }

  if (input.stats.inventoryizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice inventoryizability below the 95% target and refresh the inventoryizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace inventoryizability coverage and refresh the inventoryizability summary.'
}

export function resolveInventoryizabilityAdminActions(): InventoryizabilityAdminAction[] {
  return ['refresh_inventoryizability_summary']
}
