import type {
  AvailabilityAdminAction,
  AvailabilityAdminRecord,
  AvailabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAvailabilityDomainInventory = {
  domain: AvailabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAvailabilityAdminRecords(
  inventory: WorkspaceAvailabilityDomainInventory[],
): AvailabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAvailabilityAdminStats(input: {
  records: AvailabilityAdminRecord[]
  postgresConnectivity: boolean
}): AvailabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const failedRuns =
    input.records.find((record) => record.domain === 'failed_runs')
      ?.recordCount ?? 0
  const blockedRuns =
    input.records.find((record) => record.domain === 'blocked_runs')
      ?.recordCount ?? 0
  const totalOutcomeRuns = completedRuns + failedRuns + blockedRuns
  const availabilityPercent =
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
    availabilityPercent,
  }
}

export function getAvailabilityAdminGuidance(input: {
  stats: AvailabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect availability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial availability coverage and refresh the availability summary.'
  }

  if (input.stats.availabilityPercent < 95) {
    return 'Workspace owners and admins can inspect run availability below the 95% target and refresh the availability summary.'
  }

  return 'Workspace owners and admins can inspect workspace availability coverage and refresh the availability summary.'
}

export function resolveAvailabilityAdminActions(): AvailabilityAdminAction[] {
  return ['refresh_availability_summary']
}
