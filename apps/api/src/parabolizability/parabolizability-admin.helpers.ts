import type {
  ParabolizabilityAdminAction,
  ParabolizabilityAdminRecord,
  ParabolizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceParabolizabilityDomainInventory = {
  domain: ParabolizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildParabolizabilityAdminRecords(
  inventory: WorkspaceParabolizabilityDomainInventory[],
): ParabolizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildParabolizabilityAdminStats(input: {
  records: ParabolizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ParabolizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'moderator_syntheses')
      ?.recordCount ?? 0
  const parabolizabilityPercent =
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
    parabolizabilityPercent,
  }
}

export function getParabolizabilityAdminGuidance(input: {
  stats: ParabolizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect parabolizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial parabolizability coverage and refresh the parabolizability summary.'
  }

  if (input.stats.parabolizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect moderator synthesis parabolizability below the 95% target and refresh the parabolizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace parabolizability coverage and refresh the parabolizability summary.'
}

export function resolveParabolizabilityAdminActions(): ParabolizabilityAdminAction[] {
  return ['refresh_parabolizability_summary']
}
