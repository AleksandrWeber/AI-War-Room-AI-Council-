import type {
  SloAdminAction,
  SloAdminRecord,
  SloAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSloDomainInventory = {
  domain: SloAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSloAdminRecords(
  inventory: WorkspaceSloDomainInventory[],
): SloAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSloAdminStats(input: {
  records: SloAdminRecord[]
  postgresConnectivity: boolean
}): SloAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const failedRuns =
    input.records.find((record) => record.domain === 'failed_runs')
      ?.recordCount ?? 0
  const blockedRuns = 0
  const totalOutcomeRuns = completedRuns + failedRuns + blockedRuns
  const successRatePercent =
    totalOutcomeRuns === 0
      ? 100
      : Math.round((completedRuns / totalOutcomeRuns) * 100)

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    successRatePercent,
  }
}

export function getSloAdminGuidance(input: { stats: SloAdminStats }) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect SLO metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial SLO coverage and refresh the SLO summary.'
  }

  if (input.stats.successRatePercent < 95) {
    return 'Workspace owners and admins can inspect run success rate signals below the 95% SLO target and refresh the SLO summary.'
  }

  return 'Workspace owners and admins can inspect workspace SLO coverage and refresh the SLO summary.'
}

export function resolveSloAdminActions(): SloAdminAction[] {
  return ['refresh_slo_summary']
}
