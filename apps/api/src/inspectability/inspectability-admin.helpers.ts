import type {
  InspectabilityAdminAction,
  InspectabilityAdminRecord,
  InspectabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceInspectabilityDomainInventory = {
  domain: InspectabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildInspectabilityAdminRecords(
  inventory: WorkspaceInspectabilityDomainInventory[],
): InspectabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildInspectabilityAdminStats(input: {
  records: InspectabilityAdminRecord[]
  postgresConnectivity: boolean
}): InspectabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'usage_events')
      ?.recordCount ?? 0
  const inspectabilityPercent =
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
    inspectabilityPercent,
  }
}

export function getInspectabilityAdminGuidance(input: {
  stats: InspectabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect inspectability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial inspectability coverage and refresh the inspectability summary.'
  }

  if (input.stats.inspectabilityPercent < 95) {
    return 'Workspace owners and admins can inspect usage inspectability below the 95% target and refresh the inspectability summary.'
  }

  return 'Workspace owners and admins can inspect workspace inspectability coverage and refresh the inspectability summary.'
}

export function resolveInspectabilityAdminActions(): InspectabilityAdminAction[] {
  return ['refresh_inspectability_summary']
}
