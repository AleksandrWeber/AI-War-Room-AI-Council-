import type {
  MaintainabilityAdminAction,
  MaintainabilityAdminRecord,
  MaintainabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMaintainabilityDomainInventory = {
  domain: MaintainabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMaintainabilityAdminRecords(
  inventory: WorkspaceMaintainabilityDomainInventory[],
): MaintainabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMaintainabilityAdminStats(input: {
  records: MaintainabilityAdminRecord[]
  postgresConnectivity: boolean
}): MaintainabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const failedRuns =
    input.records.find((record) => record.domain === 'failed_runs')
      ?.recordCount ?? 0
  const totalOutcomeRuns = completedRuns + failedRuns
  const maintainabilityPercent =
    totalOutcomeRuns === 0
      ? 100
      : Math.round((completedRuns / totalOutcomeRuns) * 100)

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    maintainabilityPercent,
  }
}

export function getMaintainabilityAdminGuidance(input: {
  stats: MaintainabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect maintainability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial maintainability coverage and refresh the maintainability summary.'
  }

  if (input.stats.maintainabilityPercent < 95) {
    return 'Workspace owners and admins can inspect run maintainability below the 95% target and refresh the maintainability summary.'
  }

  return 'Workspace owners and admins can inspect workspace maintainability coverage and refresh the maintainability summary.'
}

export function resolveMaintainabilityAdminActions(): MaintainabilityAdminAction[] {
  return ['refresh_maintainability_summary']
}
