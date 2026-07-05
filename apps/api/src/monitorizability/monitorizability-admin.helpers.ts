import type {
  MonitorizabilityAdminAction,
  MonitorizabilityAdminRecord,
  MonitorizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMonitorizabilityDomainInventory = {
  domain: MonitorizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMonitorizabilityAdminRecords(
  inventory: WorkspaceMonitorizabilityDomainInventory[],
): MonitorizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMonitorizabilityAdminStats(input: {
  records: MonitorizabilityAdminRecord[]
  postgresConnectivity: boolean
}): MonitorizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const monitorizabilityPercent =
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
    monitorizabilityPercent,
  }
}

export function getMonitorizabilityAdminGuidance(input: {
  stats: MonitorizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect monitorizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial monitorizability coverage and refresh the monitorizability summary.'
  }

  if (input.stats.monitorizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership monitorizability below the 95% target and refresh the monitorizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace monitorizability coverage and refresh the monitorizability summary.'
}

export function resolveMonitorizabilityAdminActions(): MonitorizabilityAdminAction[] {
  return ['refresh_monitorizability_summary']
}
