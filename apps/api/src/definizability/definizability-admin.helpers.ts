import type {
  DefinizabilityAdminAction,
  DefinizabilityAdminRecord,
  DefinizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDefinizabilityDomainInventory = {
  domain: DefinizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDefinizabilityAdminRecords(
  inventory: WorkspaceDefinizabilityDomainInventory[],
): DefinizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDefinizabilityAdminStats(input: {
  records: DefinizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DefinizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const definizabilityPercent =
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
    definizabilityPercent,
  }
}

export function getDefinizabilityAdminGuidance(input: {
  stats: DefinizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect definizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial definizability coverage and refresh the definizability summary.'
  }

  if (input.stats.definizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership definizability below the 95% target and refresh the definizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace definizability coverage and refresh the definizability summary.'
}

export function resolveDefinizabilityAdminActions(): DefinizabilityAdminAction[] {
  return ['refresh_definizability_summary']
}
