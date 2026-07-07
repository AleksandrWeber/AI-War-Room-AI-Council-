import type {
  AttributabilityvaultizabilityAdminAction,
  AttributabilityvaultizabilityAdminRecord,
  AttributabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAttributabilityvaultizabilityDomainInventory = {
  domain: AttributabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAttributabilityvaultizabilityAdminRecords(
  inventory: WorkspaceAttributabilityvaultizabilityDomainInventory[],
): AttributabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAttributabilityvaultizabilityAdminStats(input: {
  records: AttributabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AttributabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const attributabilityvaultizabilityPercent =
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
    attributabilityvaultizabilityPercent,
  }
}

export function getAttributabilityvaultizabilityAdminGuidance(input: {
  stats: AttributabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect attributabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial attributabilityvaultizability coverage and refresh the attributabilityvaultizability summary.'
  }

  if (input.stats.attributabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice attributabilityvaultizability below the 95% target and refresh the attributabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace attributabilityvaultizability coverage and refresh the attributabilityvaultizability summary.'
}

export function resolveAttributabilityvaultizabilityAdminActions(): AttributabilityvaultizabilityAdminAction[] {
  return ['refresh_attributabilityvaultizability_summary']
}
