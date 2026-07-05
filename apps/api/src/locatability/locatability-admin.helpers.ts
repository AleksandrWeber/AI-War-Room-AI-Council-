import type {
  LocatabilityAdminAction,
  LocatabilityAdminRecord,
  LocatabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceLocatabilityDomainInventory = {
  domain: LocatabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildLocatabilityAdminRecords(
  inventory: WorkspaceLocatabilityDomainInventory[],
): LocatabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildLocatabilityAdminStats(input: {
  records: LocatabilityAdminRecord[]
  postgresConnectivity: boolean
}): LocatabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const locatabilityPercent =
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
    locatabilityPercent,
  }
}

export function getLocatabilityAdminGuidance(input: {
  stats: LocatabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect locatability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial locatability coverage and refresh the locatability summary.'
  }

  if (input.stats.locatabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential locatability below the 95% target and refresh the locatability summary.'
  }

  return 'Workspace owners and admins can inspect workspace locatability coverage and refresh the locatability summary.'
}

export function resolveLocatabilityAdminActions(): LocatabilityAdminAction[] {
  return ['refresh_locatability_summary']
}
