import type {
  DesirabilityAdminAction,
  DesirabilityAdminRecord,
  DesirabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDesirabilityDomainInventory = {
  domain: DesirabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDesirabilityAdminRecords(
  inventory: WorkspaceDesirabilityDomainInventory[],
): DesirabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDesirabilityAdminStats(input: {
  records: DesirabilityAdminRecord[]
  postgresConnectivity: boolean
}): DesirabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'usage_events')
      ?.recordCount ?? 0
  const desirabilityPercent =
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
    desirabilityPercent,
  }
}

export function getDesirabilityAdminGuidance(input: {
  stats: DesirabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect desirability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial desirability coverage and refresh the desirability summary.'
  }

  if (input.stats.desirabilityPercent < 95) {
    return 'Workspace owners and admins can inspect usage event desirability below the 95% target and refresh the desirability summary.'
  }

  return 'Workspace owners and admins can inspect workspace desirability coverage and refresh the desirability summary.'
}

export function resolveDesirabilityAdminActions(): DesirabilityAdminAction[] {
  return ['refresh_desirability_summary']
}
