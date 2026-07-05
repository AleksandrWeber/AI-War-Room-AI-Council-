import type {
  RegistryizabilityAdminAction,
  RegistryizabilityAdminRecord,
  RegistryizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRegistryizabilityDomainInventory = {
  domain: RegistryizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRegistryizabilityAdminRecords(
  inventory: WorkspaceRegistryizabilityDomainInventory[],
): RegistryizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRegistryizabilityAdminStats(input: {
  records: RegistryizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RegistryizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const registryizabilityPercent =
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
    registryizabilityPercent,
  }
}

export function getRegistryizabilityAdminGuidance(input: {
  stats: RegistryizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect registryizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial registryizability coverage and refresh the registryizability summary.'
  }

  if (input.stats.registryizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification registryizability below the 95% target and refresh the registryizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace registryizability coverage and refresh the registryizability summary.'
}

export function resolveRegistryizabilityAdminActions(): RegistryizabilityAdminAction[] {
  return ['refresh_registryizability_summary']
}
