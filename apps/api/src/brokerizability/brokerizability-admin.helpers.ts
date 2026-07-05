import type {
  BrokerizabilityAdminAction,
  BrokerizabilityAdminRecord,
  BrokerizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceBrokerizabilityDomainInventory = {
  domain: BrokerizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildBrokerizabilityAdminRecords(
  inventory: WorkspaceBrokerizabilityDomainInventory[],
): BrokerizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildBrokerizabilityAdminStats(input: {
  records: BrokerizabilityAdminRecord[]
  postgresConnectivity: boolean
}): BrokerizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const brokerizabilityPercent =
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
    brokerizabilityPercent,
  }
}

export function getBrokerizabilityAdminGuidance(input: {
  stats: BrokerizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect brokerizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial brokerizability coverage and refresh the brokerizability summary.'
  }

  if (input.stats.brokerizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential brokerizability below the 95% target and refresh the brokerizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace brokerizability coverage and refresh the brokerizability summary.'
}

export function resolveBrokerizabilityAdminActions(): BrokerizabilityAdminAction[] {
  return ['refresh_brokerizability_summary']
}
