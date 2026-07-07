import type {
  TracevaultizabilityAdminAction,
  TracevaultizabilityAdminRecord,
  TracevaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTracevaultizabilityDomainInventory = {
  domain: TracevaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTracevaultizabilityAdminRecords(
  inventory: WorkspaceTracevaultizabilityDomainInventory[],
): TracevaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTracevaultizabilityAdminStats(input: {
  records: TracevaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TracevaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const tracevaultizabilityPercent =
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
    tracevaultizabilityPercent,
  }
}

export function getTracevaultizabilityAdminGuidance(input: {
  stats: TracevaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect tracevaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial tracevaultizability coverage and refresh the tracevaultizability summary.'
  }

  if (input.stats.tracevaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership tracevaultizability below the 95% target and refresh the tracevaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace tracevaultizability coverage and refresh the tracevaultizability summary.'
}

export function resolveTracevaultizabilityAdminActions(): TracevaultizabilityAdminAction[] {
  return ['refresh_tracevaultizability_summary']
}
