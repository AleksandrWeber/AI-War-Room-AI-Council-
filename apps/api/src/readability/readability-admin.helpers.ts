import type {
  ReadabilityAdminAction,
  ReadabilityAdminRecord,
  ReadabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceReadabilityDomainInventory = {
  domain: ReadabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildReadabilityAdminRecords(
  inventory: WorkspaceReadabilityDomainInventory[],
): ReadabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildReadabilityAdminStats(input: {
  records: ReadabilityAdminRecord[]
  postgresConnectivity: boolean
}): ReadabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'artifacts')
      ?.recordCount ?? 0
  const readabilityPercent =
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
    readabilityPercent,
  }
}

export function getReadabilityAdminGuidance(input: {
  stats: ReadabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect readability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial readability coverage and refresh the readability summary.'
  }

  if (input.stats.readabilityPercent < 95) {
    return 'Workspace owners and admins can inspect artifact readability below the 95% target and refresh the readability summary.'
  }

  return 'Workspace owners and admins can inspect workspace readability coverage and refresh the readability summary.'
}

export function resolveReadabilityAdminActions(): ReadabilityAdminAction[] {
  return ['refresh_readability_summary']
}
