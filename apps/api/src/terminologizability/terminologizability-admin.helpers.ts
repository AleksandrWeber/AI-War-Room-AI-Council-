import type {
  TerminologizabilityAdminAction,
  TerminologizabilityAdminRecord,
  TerminologizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTerminologizabilityDomainInventory = {
  domain: TerminologizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTerminologizabilityAdminRecords(
  inventory: WorkspaceTerminologizabilityDomainInventory[],
): TerminologizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTerminologizabilityAdminStats(input: {
  records: TerminologizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TerminologizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const terminologizabilityPercent =
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
    terminologizabilityPercent,
  }
}

export function getTerminologizabilityAdminGuidance(input: {
  stats: TerminologizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect terminologizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial terminologizability coverage and refresh the terminologizability summary.'
  }

  if (input.stats.terminologizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership terminologizability below the 95% target and refresh the terminologizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace terminologizability coverage and refresh the terminologizability summary.'
}

export function resolveTerminologizabilityAdminActions(): TerminologizabilityAdminAction[] {
  return ['refresh_terminologizability_summary']
}
