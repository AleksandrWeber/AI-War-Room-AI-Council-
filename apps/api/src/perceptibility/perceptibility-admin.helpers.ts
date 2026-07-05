import type {
  PerceptibilityAdminAction,
  PerceptibilityAdminRecord,
  PerceptibilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePerceptibilityDomainInventory = {
  domain: PerceptibilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPerceptibilityAdminRecords(
  inventory: WorkspacePerceptibilityDomainInventory[],
): PerceptibilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPerceptibilityAdminStats(input: {
  records: PerceptibilityAdminRecord[]
  postgresConnectivity: boolean
}): PerceptibilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'usage_events')
      ?.recordCount ?? 0
  const perceptibilityPercent =
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
    perceptibilityPercent,
  }
}

export function getPerceptibilityAdminGuidance(input: {
  stats: PerceptibilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect perceptibility metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial perceptibility coverage and refresh the perceptibility summary.'
  }

  if (input.stats.perceptibilityPercent < 95) {
    return 'Workspace owners and admins can inspect usage event perceptibility below the 95% target and refresh the perceptibility summary.'
  }

  return 'Workspace owners and admins can inspect workspace perceptibility coverage and refresh the perceptibility summary.'
}

export function resolvePerceptibilityAdminActions(): PerceptibilityAdminAction[] {
  return ['refresh_perceptibility_summary']
}
