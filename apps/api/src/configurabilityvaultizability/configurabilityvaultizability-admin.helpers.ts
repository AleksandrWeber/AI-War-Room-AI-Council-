import type {
  ConfigurabilityvaultizabilityAdminAction,
  ConfigurabilityvaultizabilityAdminRecord,
  ConfigurabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceConfigurabilityvaultizabilityDomainInventory = {
  domain: ConfigurabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildConfigurabilityvaultizabilityAdminRecords(
  inventory: WorkspaceConfigurabilityvaultizabilityDomainInventory[],
): ConfigurabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildConfigurabilityvaultizabilityAdminStats(input: {
  records: ConfigurabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ConfigurabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const configurabilityvaultizabilityPercent =
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
    configurabilityvaultizabilityPercent,
  }
}

export function getConfigurabilityvaultizabilityAdminGuidance(input: {
  stats: ConfigurabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect configurabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial configurabilityvaultizability coverage and refresh the configurabilityvaultizability summary.'
  }

  if (input.stats.configurabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice configurabilityvaultizability below the 95% target and refresh the configurabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace configurabilityvaultizability coverage and refresh the configurabilityvaultizability summary.'
}

export function resolveConfigurabilityvaultizabilityAdminActions(): ConfigurabilityvaultizabilityAdminAction[] {
  return ['refresh_configurabilityvaultizability_summary']
}
