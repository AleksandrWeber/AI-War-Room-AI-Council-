import type {
  AffordabilityAdminAction,
  AffordabilityAdminRecord,
  AffordabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAffordabilityDomainInventory = {
  domain: AffordabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAffordabilityAdminRecords(
  inventory: WorkspaceAffordabilityDomainInventory[],
): AffordabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAffordabilityAdminStats(input: {
  records: AffordabilityAdminRecord[]
  postgresConnectivity: boolean
}): AffordabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const affordabilityPercent =
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
    affordabilityPercent,
  }
}

export function getAffordabilityAdminGuidance(input: {
  stats: AffordabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect affordability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial affordability coverage and refresh the affordability summary.'
  }

  if (input.stats.affordabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice affordability below the 95% target and refresh the affordability summary.'
  }

  return 'Workspace owners and admins can inspect workspace affordability coverage and refresh the affordability summary.'
}

export function resolveAffordabilityAdminActions(): AffordabilityAdminAction[] {
  return ['refresh_affordability_summary']
}
