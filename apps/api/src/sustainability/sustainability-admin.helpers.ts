import type {
  SustainabilityAdminAction,
  SustainabilityAdminRecord,
  SustainabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSustainabilityDomainInventory = {
  domain: SustainabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSustainabilityAdminRecords(
  inventory: WorkspaceSustainabilityDomainInventory[],
): SustainabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSustainabilityAdminStats(input: {
  records: SustainabilityAdminRecord[]
  postgresConnectivity: boolean
}): SustainabilityAdminStats {
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
  const sustainabilityPercent =
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
    sustainabilityPercent,
  }
}

export function getSustainabilityAdminGuidance(input: {
  stats: SustainabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect sustainability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial sustainability coverage and refresh the sustainability summary.'
  }

  if (input.stats.sustainabilityPercent < 95) {
    return 'Workspace owners and admins can inspect run sustainability below the 95% target and refresh the sustainability summary.'
  }

  return 'Workspace owners and admins can inspect workspace sustainability coverage and refresh the sustainability summary.'
}

export function resolveSustainabilityAdminActions(): SustainabilityAdminAction[] {
  return ['refresh_sustainability_summary']
}
