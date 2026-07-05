import type {
  RetrodictizabilityAdminAction,
  RetrodictizabilityAdminRecord,
  RetrodictizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRetrodictizabilityDomainInventory = {
  domain: RetrodictizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRetrodictizabilityAdminRecords(
  inventory: WorkspaceRetrodictizabilityDomainInventory[],
): RetrodictizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRetrodictizabilityAdminStats(input: {
  records: RetrodictizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RetrodictizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const retrodictizabilityPercent =
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
    retrodictizabilityPercent,
  }
}

export function getRetrodictizabilityAdminGuidance(input: {
  stats: RetrodictizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect retrodictizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial retrodictizability coverage and refresh the retrodictizability summary.'
  }

  if (input.stats.retrodictizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership retrodictizability below the 95% target and refresh the retrodictizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace retrodictizability coverage and refresh the retrodictizability summary.'
}

export function resolveRetrodictizabilityAdminActions(): RetrodictizabilityAdminAction[] {
  return ['refresh_retrodictizability_summary']
}
