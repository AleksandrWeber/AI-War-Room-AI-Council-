import type {
  EntitlementizabilityAdminAction,
  EntitlementizabilityAdminRecord,
  EntitlementizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceEntitlementizabilityDomainInventory = {
  domain: EntitlementizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildEntitlementizabilityAdminRecords(
  inventory: WorkspaceEntitlementizabilityDomainInventory[],
): EntitlementizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildEntitlementizabilityAdminStats(input: {
  records: EntitlementizabilityAdminRecord[]
  postgresConnectivity: boolean
}): EntitlementizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const entitlementizabilityPercent =
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
    entitlementizabilityPercent,
  }
}

export function getEntitlementizabilityAdminGuidance(input: {
  stats: EntitlementizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect entitlementizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial entitlementizability coverage and refresh the entitlementizability summary.'
  }

  if (input.stats.entitlementizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice entitlementizability below the 95% target and refresh the entitlementizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace entitlementizability coverage and refresh the entitlementizability summary.'
}

export function resolveEntitlementizabilityAdminActions(): EntitlementizabilityAdminAction[] {
  return ['refresh_entitlementizability_summary']
}
