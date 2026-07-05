import type {
  NoticeabilityAdminAction,
  NoticeabilityAdminRecord,
  NoticeabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceNoticeabilityDomainInventory = {
  domain: NoticeabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildNoticeabilityAdminRecords(
  inventory: WorkspaceNoticeabilityDomainInventory[],
): NoticeabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildNoticeabilityAdminStats(input: {
  records: NoticeabilityAdminRecord[]
  postgresConnectivity: boolean
}): NoticeabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const noticeabilityPercent =
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
    noticeabilityPercent,
  }
}

export function getNoticeabilityAdminGuidance(input: {
  stats: NoticeabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect noticeability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial noticeability coverage and refresh the noticeability summary.'
  }

  if (input.stats.noticeabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification noticeability below the 95% target and refresh the noticeability summary.'
  }

  return 'Workspace owners and admins can inspect workspace noticeability coverage and refresh the noticeability summary.'
}

export function resolveNoticeabilityAdminActions(): NoticeabilityAdminAction[] {
  return ['refresh_noticeability_summary']
}
