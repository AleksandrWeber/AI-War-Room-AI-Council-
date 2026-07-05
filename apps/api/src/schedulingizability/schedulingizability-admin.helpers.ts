import type {
  SchedulingizabilityAdminAction,
  SchedulingizabilityAdminRecord,
  SchedulingizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSchedulingizabilityDomainInventory = {
  domain: SchedulingizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSchedulingizabilityAdminRecords(
  inventory: WorkspaceSchedulingizabilityDomainInventory[],
): SchedulingizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSchedulingizabilityAdminStats(input: {
  records: SchedulingizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SchedulingizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const schedulingizabilityPercent =
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
    schedulingizabilityPercent,
  }
}

export function getSchedulingizabilityAdminGuidance(input: {
  stats: SchedulingizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect schedulingizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial schedulingizability coverage and refresh the schedulingizability summary.'
  }

  if (input.stats.schedulingizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage schedulingizability below the 95% target and refresh the schedulingizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace schedulingizability coverage and refresh the schedulingizability summary.'
}

export function resolveSchedulingizabilityAdminActions(): SchedulingizabilityAdminAction[] {
  return ['refresh_schedulingizability_summary']
}
