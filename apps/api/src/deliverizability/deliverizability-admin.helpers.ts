import type {
  DeliverizabilityAdminAction,
  DeliverizabilityAdminRecord,
  DeliverizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDeliverizabilityDomainInventory = {
  domain: DeliverizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDeliverizabilityAdminRecords(
  inventory: WorkspaceDeliverizabilityDomainInventory[],
): DeliverizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDeliverizabilityAdminStats(input: {
  records: DeliverizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DeliverizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const deliverizabilityPercent =
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
    deliverizabilityPercent,
  }
}

export function getDeliverizabilityAdminGuidance(input: {
  stats: DeliverizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect deliverizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial deliverizability coverage and refresh the deliverizability summary.'
  }

  if (input.stats.deliverizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential deliverizability below the 95% target and refresh the deliverizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace deliverizability coverage and refresh the deliverizability summary.'
}

export function resolveDeliverizabilityAdminActions(): DeliverizabilityAdminAction[] {
  return ['refresh_deliverizability_summary']
}
