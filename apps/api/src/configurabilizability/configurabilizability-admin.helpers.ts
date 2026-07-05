import type {
  ConfigurabilizabilityAdminAction,
  ConfigurabilizabilityAdminRecord,
  ConfigurabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceConfigurabilizabilityDomainInventory = {
  domain: ConfigurabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildConfigurabilizabilityAdminRecords(
  inventory: WorkspaceConfigurabilizabilityDomainInventory[],
): ConfigurabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildConfigurabilizabilityAdminStats(input: {
  records: ConfigurabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ConfigurabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const configurabilizabilityPercent =
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
    configurabilizabilityPercent,
  }
}

export function getConfigurabilizabilityAdminGuidance(input: {
  stats: ConfigurabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect configurabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial configurabilizability coverage and refresh the configurabilizability summary.'
  }

  if (input.stats.configurabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan configurabilizability below the 95% target and refresh the configurabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace configurabilizability coverage and refresh the configurabilizability summary.'
}

export function resolveConfigurabilizabilityAdminActions(): ConfigurabilizabilityAdminAction[] {
  return ['refresh_configurabilizability_summary']
}
