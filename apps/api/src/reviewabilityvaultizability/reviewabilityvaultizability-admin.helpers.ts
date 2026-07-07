import type {
  ReviewabilityvaultizabilityAdminAction,
  ReviewabilityvaultizabilityAdminRecord,
  ReviewabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceReviewabilityvaultizabilityDomainInventory = {
  domain: ReviewabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildReviewabilityvaultizabilityAdminRecords(
  inventory: WorkspaceReviewabilityvaultizabilityDomainInventory[],
): ReviewabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildReviewabilityvaultizabilityAdminStats(input: {
  records: ReviewabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ReviewabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const reviewabilityvaultizabilityPercent =
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
    reviewabilityvaultizabilityPercent,
  }
}

export function getReviewabilityvaultizabilityAdminGuidance(input: {
  stats: ReviewabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect reviewabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial reviewabilityvaultizability coverage and refresh the reviewabilityvaultizability summary.'
  }

  if (input.stats.reviewabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification reviewabilityvaultizability below the 95% target and refresh the reviewabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace reviewabilityvaultizability coverage and refresh the reviewabilityvaultizability summary.'
}

export function resolveReviewabilityvaultizabilityAdminActions(): ReviewabilityvaultizabilityAdminAction[] {
  return ['refresh_reviewabilityvaultizability_summary']
}
