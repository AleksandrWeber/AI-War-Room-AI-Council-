import type {
  WindowizabilityAdminAction,
  WindowizabilityAdminRecord,
  WindowizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceWindowizabilityDomainInventory = {
  domain: WindowizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildWindowizabilityAdminRecords(
  inventory: WorkspaceWindowizabilityDomainInventory[],
): WindowizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildWindowizabilityAdminStats(input: {
  records: WindowizabilityAdminRecord[]
  postgresConnectivity: boolean
}): WindowizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const windowizabilityPercent =
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
    windowizabilityPercent,
  }
}

export function getWindowizabilityAdminGuidance(input: {
  stats: WindowizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect windowizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial windowizability coverage and refresh the windowizability summary.'
  }

  if (input.stats.windowizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification windowizability below the 95% target and refresh the windowizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace windowizability coverage and refresh the windowizability summary.'
}

export function resolveWindowizabilityAdminActions(): WindowizabilityAdminAction[] {
  return ['refresh_windowizability_summary']
}
