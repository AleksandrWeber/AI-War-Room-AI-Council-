import type {
  ClarityAdminAction,
  ClarityAdminRecord,
  ClarityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceClarityDomainInventory = {
  domain: ClarityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildClarityAdminRecords(
  inventory: WorkspaceClarityDomainInventory[],
): ClarityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildClarityAdminStats(input: {
  records: ClarityAdminRecord[]
  postgresConnectivity: boolean
}): ClarityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'moderator_syntheses')
      ?.recordCount ?? 0
  const clarityPercent =
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
    clarityPercent,
  }
}

export function getClarityAdminGuidance(input: {
  stats: ClarityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect clarity metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial clarity coverage and refresh the clarity summary.'
  }

  if (input.stats.clarityPercent < 95) {
    return 'Workspace owners and admins can inspect moderator synthesis clarity below the 95% target and refresh the clarity summary.'
  }

  return 'Workspace owners and admins can inspect workspace clarity coverage and refresh the clarity summary.'
}

export function resolveClarityAdminActions(): ClarityAdminAction[] {
  return ['refresh_clarity_summary']
}
