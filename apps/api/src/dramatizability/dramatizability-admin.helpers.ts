import type {
  DramatizabilityAdminAction,
  DramatizabilityAdminRecord,
  DramatizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDramatizabilityDomainInventory = {
  domain: DramatizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDramatizabilityAdminRecords(
  inventory: WorkspaceDramatizabilityDomainInventory[],
): DramatizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDramatizabilityAdminStats(input: {
  records: DramatizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DramatizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'artifacts')
      ?.recordCount ?? 0
  const dramatizabilityPercent =
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
    dramatizabilityPercent,
  }
}

export function getDramatizabilityAdminGuidance(input: {
  stats: DramatizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect dramatizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial dramatizability coverage and refresh the dramatizability summary.'
  }

  if (input.stats.dramatizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect artifact dramatizability below the 95% target and refresh the dramatizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace dramatizability coverage and refresh the dramatizability summary.'
}

export function resolveDramatizabilityAdminActions(): DramatizabilityAdminAction[] {
  return ['refresh_dramatizability_summary']
}
