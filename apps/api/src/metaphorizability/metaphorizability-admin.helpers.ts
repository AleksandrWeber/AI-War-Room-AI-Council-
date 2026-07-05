import type {
  MetaphorizabilityAdminAction,
  MetaphorizabilityAdminRecord,
  MetaphorizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMetaphorizabilityDomainInventory = {
  domain: MetaphorizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMetaphorizabilityAdminRecords(
  inventory: WorkspaceMetaphorizabilityDomainInventory[],
): MetaphorizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMetaphorizabilityAdminStats(input: {
  records: MetaphorizabilityAdminRecord[]
  postgresConnectivity: boolean
}): MetaphorizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const metaphorizabilityPercent =
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
    metaphorizabilityPercent,
  }
}

export function getMetaphorizabilityAdminGuidance(input: {
  stats: MetaphorizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect metaphorizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial metaphorizability coverage and refresh the metaphorizability summary.'
  }

  if (input.stats.metaphorizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential metaphorizability below the 95% target and refresh the metaphorizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace metaphorizability coverage and refresh the metaphorizability summary.'
}

export function resolveMetaphorizabilityAdminActions(): MetaphorizabilityAdminAction[] {
  return ['refresh_metaphorizability_summary']
}
