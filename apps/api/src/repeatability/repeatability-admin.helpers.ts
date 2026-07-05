import type {
  RepeatabilityAdminAction,
  RepeatabilityAdminRecord,
  RepeatabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRepeatabilityDomainInventory = {
  domain: RepeatabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRepeatabilityAdminRecords(
  inventory: WorkspaceRepeatabilityDomainInventory[],
): RepeatabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRepeatabilityAdminStats(input: {
  records: RepeatabilityAdminRecord[]
  postgresConnectivity: boolean
}): RepeatabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'artifacts')
      ?.recordCount ?? 0
  const repeatabilityPercent =
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
    repeatabilityPercent,
  }
}

export function getRepeatabilityAdminGuidance(input: {
  stats: RepeatabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect repeatability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial repeatability coverage and refresh the repeatability summary.'
  }

  if (input.stats.repeatabilityPercent < 95) {
    return 'Workspace owners and admins can inspect artifact repeatability below the 95% target and refresh the repeatability summary.'
  }

  return 'Workspace owners and admins can inspect workspace repeatability coverage and refresh the repeatability summary.'
}

export function resolveRepeatabilityAdminActions(): RepeatabilityAdminAction[] {
  return ['refresh_repeatability_summary']
}
