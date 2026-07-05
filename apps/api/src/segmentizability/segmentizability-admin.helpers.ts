import type {
  SegmentizabilityAdminAction,
  SegmentizabilityAdminRecord,
  SegmentizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSegmentizabilityDomainInventory = {
  domain: SegmentizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSegmentizabilityAdminRecords(
  inventory: WorkspaceSegmentizabilityDomainInventory[],
): SegmentizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSegmentizabilityAdminStats(input: {
  records: SegmentizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SegmentizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const segmentizabilityPercent =
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
    segmentizabilityPercent,
  }
}

export function getSegmentizabilityAdminGuidance(input: {
  stats: SegmentizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect segmentizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial segmentizability coverage and refresh the segmentizability summary.'
  }

  if (input.stats.segmentizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit segmentizability below the 95% target and refresh the segmentizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace segmentizability coverage and refresh the segmentizability summary.'
}

export function resolveSegmentizabilityAdminActions(): SegmentizabilityAdminAction[] {
  return ['refresh_segmentizability_summary']
}
