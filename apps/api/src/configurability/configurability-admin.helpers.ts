import type {
  ConfigurabilityAdminAction,
  ConfigurabilityAdminRecord,
  ConfigurabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceConfigurabilityDomainInventory = {
  domain: ConfigurabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildConfigurabilityAdminRecords(
  inventory: WorkspaceConfigurabilityDomainInventory[],
): ConfigurabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildConfigurabilityAdminStats(input: {
  records: ConfigurabilityAdminRecord[]
  postgresConnectivity: boolean
}): ConfigurabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const configurabilityPercent =
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
    configurabilityPercent,
  }
}

export function getConfigurabilityAdminGuidance(input: {
  stats: ConfigurabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect configurability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial configurability coverage and refresh the configurability summary.'
  }

  if (input.stats.configurabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential configurability below the 95% target and refresh the configurability summary.'
  }

  return 'Workspace owners and admins can inspect workspace configurability coverage and refresh the configurability summary.'
}

export function resolveConfigurabilityAdminActions(): ConfigurabilityAdminAction[] {
  return ['refresh_configurability_summary']
}
