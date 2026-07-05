import type {
  MaintainabilizabilityAdminAction,
  MaintainabilizabilityAdminRecord,
  MaintainabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMaintainabilizabilityDomainInventory = {
  domain: MaintainabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMaintainabilizabilityAdminRecords(
  inventory: WorkspaceMaintainabilizabilityDomainInventory[],
): MaintainabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMaintainabilizabilityAdminStats(input: {
  records: MaintainabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): MaintainabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const maintainabilizabilityPercent =
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
    maintainabilizabilityPercent,
  }
}

export function getMaintainabilizabilityAdminGuidance(input: {
  stats: MaintainabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect maintainabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial maintainabilizability coverage and refresh the maintainabilizability summary.'
  }

  if (input.stats.maintainabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership maintainabilizability below the 95% target and refresh the maintainabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace maintainabilizability coverage and refresh the maintainabilizability summary.'
}

export function resolveMaintainabilizabilityAdminActions(): MaintainabilizabilityAdminAction[] {
  return ['refresh_maintainabilizability_summary']
}
