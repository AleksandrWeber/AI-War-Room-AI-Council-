import type {
  ConnectabilityvaultizabilityAdminAction,
  ConnectabilityvaultizabilityAdminRecord,
  ConnectabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceConnectabilityvaultizabilityDomainInventory = {
  domain: ConnectabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildConnectabilityvaultizabilityAdminRecords(
  inventory: WorkspaceConnectabilityvaultizabilityDomainInventory[],
): ConnectabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildConnectabilityvaultizabilityAdminStats(input: {
  records: ConnectabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ConnectabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const connectabilityvaultizabilityPercent =
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
    connectabilityvaultizabilityPercent,
  }
}

export function getConnectabilityvaultizabilityAdminGuidance(input: {
  stats: ConnectabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect connectabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial connectabilityvaultizability coverage and refresh the connectabilityvaultizability summary.'
  }

  if (input.stats.connectabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice connectabilityvaultizability below the 95% target and refresh the connectabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace connectabilityvaultizability coverage and refresh the connectabilityvaultizability summary.'
}

export function resolveConnectabilityvaultizabilityAdminActions(): ConnectabilityvaultizabilityAdminAction[] {
  return ['refresh_connectabilityvaultizability_summary']
}
