import type {
  AvailabilizabilityAdminAction,
  AvailabilizabilityAdminRecord,
  AvailabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAvailabilizabilityDomainInventory = {
  domain: AvailabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAvailabilizabilityAdminRecords(
  inventory: WorkspaceAvailabilizabilityDomainInventory[],
): AvailabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAvailabilizabilityAdminStats(input: {
  records: AvailabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AvailabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const availabilizabilityPercent =
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
    availabilizabilityPercent,
  }
}

export function getAvailabilizabilityAdminGuidance(input: {
  stats: AvailabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect availabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial availabilizability coverage and refresh the availabilizability summary.'
  }

  if (input.stats.availabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan availabilizability below the 95% target and refresh the availabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace availabilizability coverage and refresh the availabilizability summary.'
}

export function resolveAvailabilizabilityAdminActions(): AvailabilizabilityAdminAction[] {
  return ['refresh_availabilizability_summary']
}
