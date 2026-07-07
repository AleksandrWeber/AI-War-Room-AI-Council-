import type {
  SchedulabilityvaultizabilityAdminAction,
  SchedulabilityvaultizabilityAdminRecord,
  SchedulabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSchedulabilityvaultizabilityDomainInventory = {
  domain: SchedulabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSchedulabilityvaultizabilityAdminRecords(
  inventory: WorkspaceSchedulabilityvaultizabilityDomainInventory[],
): SchedulabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSchedulabilityvaultizabilityAdminStats(input: {
  records: SchedulabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SchedulabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const schedulabilityvaultizabilityPercent =
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
    schedulabilityvaultizabilityPercent,
  }
}

export function getSchedulabilityvaultizabilityAdminGuidance(input: {
  stats: SchedulabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect schedulabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial schedulabilityvaultizability coverage and refresh the schedulabilityvaultizability summary.'
  }

  if (input.stats.schedulabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership schedulabilityvaultizability below the 95% target and refresh the schedulabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace schedulabilityvaultizability coverage and refresh the schedulabilityvaultizability summary.'
}

export function resolveSchedulabilityvaultizabilityAdminActions(): SchedulabilityvaultizabilityAdminAction[] {
  return ['refresh_schedulabilityvaultizability_summary']
}
