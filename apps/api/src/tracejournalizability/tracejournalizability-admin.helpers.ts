import type {
  TracejournalizabilityAdminAction,
  TracejournalizabilityAdminRecord,
  TracejournalizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTracejournalizabilityDomainInventory = {
  domain: TracejournalizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTracejournalizabilityAdminRecords(
  inventory: WorkspaceTracejournalizabilityDomainInventory[],
): TracejournalizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTracejournalizabilityAdminStats(input: {
  records: TracejournalizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TracejournalizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const tracejournalizabilityPercent =
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
    tracejournalizabilityPercent,
  }
}

export function getTracejournalizabilityAdminGuidance(input: {
  stats: TracejournalizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect tracejournalizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial tracejournalizability coverage and refresh the tracejournalizability summary.'
  }

  if (input.stats.tracejournalizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership tracejournalizability below the 95% target and refresh the tracejournalizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace tracejournalizability coverage and refresh the tracejournalizability summary.'
}

export function resolveTracejournalizabilityAdminActions(): TracejournalizabilityAdminAction[] {
  return ['refresh_tracejournalizability_summary']
}
