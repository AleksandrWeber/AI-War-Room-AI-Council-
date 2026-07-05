import type {
  JustifiabilityAdminAction,
  JustifiabilityAdminRecord,
  JustifiabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceJustifiabilityDomainInventory = {
  domain: JustifiabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildJustifiabilityAdminRecords(
  inventory: WorkspaceJustifiabilityDomainInventory[],
): JustifiabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildJustifiabilityAdminStats(input: {
  records: JustifiabilityAdminRecord[]
  postgresConnectivity: boolean
}): JustifiabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_reviews')
      ?.recordCount ?? 0
  const justifiabilityPercent =
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
    justifiabilityPercent,
  }
}

export function getJustifiabilityAdminGuidance(input: {
  stats: JustifiabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect justifiability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial justifiability coverage and refresh the justifiability summary.'
  }

  if (input.stats.justifiabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield review justifiability below the 95% target and refresh the justifiability summary.'
  }

  return 'Workspace owners and admins can inspect workspace justifiability coverage and refresh the justifiability summary.'
}

export function resolveJustifiabilityAdminActions(): JustifiabilityAdminAction[] {
  return ['refresh_justifiability_summary']
}
