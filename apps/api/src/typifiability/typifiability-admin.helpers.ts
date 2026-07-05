import type {
  TypifiabilityAdminAction,
  TypifiabilityAdminRecord,
  TypifiabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTypifiabilityDomainInventory = {
  domain: TypifiabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTypifiabilityAdminRecords(
  inventory: WorkspaceTypifiabilityDomainInventory[],
): TypifiabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTypifiabilityAdminStats(input: {
  records: TypifiabilityAdminRecord[]
  postgresConnectivity: boolean
}): TypifiabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const typifiabilityPercent =
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
    typifiabilityPercent,
  }
}

export function getTypifiabilityAdminGuidance(input: {
  stats: TypifiabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect typifiability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial typifiability coverage and refresh the typifiability summary.'
  }

  if (input.stats.typifiabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit typifiability below the 95% target and refresh the typifiability summary.'
  }

  return 'Workspace owners and admins can inspect workspace typifiability coverage and refresh the typifiability summary.'
}

export function resolveTypifiabilityAdminActions(): TypifiabilityAdminAction[] {
  return ['refresh_typifiability_summary']
}
