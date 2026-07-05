import type {
  TypologizabilityAdminAction,
  TypologizabilityAdminRecord,
  TypologizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTypologizabilityDomainInventory = {
  domain: TypologizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTypologizabilityAdminRecords(
  inventory: WorkspaceTypologizabilityDomainInventory[],
): TypologizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTypologizabilityAdminStats(input: {
  records: TypologizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TypologizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const typologizabilityPercent =
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
    typologizabilityPercent,
  }
}

export function getTypologizabilityAdminGuidance(input: {
  stats: TypologizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect typologizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial typologizability coverage and refresh the typologizability summary.'
  }

  if (input.stats.typologizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership typologizability below the 95% target and refresh the typologizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace typologizability coverage and refresh the typologizability summary.'
}

export function resolveTypologizabilityAdminActions(): TypologizabilityAdminAction[] {
  return ['refresh_typologizability_summary']
}
