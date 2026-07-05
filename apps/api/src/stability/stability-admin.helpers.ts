import type {
  StabilityAdminAction,
  StabilityAdminRecord,
  StabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceStabilityDomainInventory = {
  domain: StabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildStabilityAdminRecords(
  inventory: WorkspaceStabilityDomainInventory[],
): StabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildStabilityAdminStats(input: {
  records: StabilityAdminRecord[]
  postgresConnectivity: boolean
}): StabilityAdminStats {
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
  const stabilityPercent =
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
    stabilityPercent,
  }
}

export function getStabilityAdminGuidance(input: { stats: StabilityAdminStats }) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect stability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial stability coverage and refresh the stability summary.'
  }

  if (input.stats.stabilityPercent < 95) {
    return 'Workspace owners and admins can inspect run stability below the 95% target and refresh the stability summary.'
  }

  return 'Workspace owners and admins can inspect workspace stability coverage and refresh the stability summary.'
}

export function resolveStabilityAdminActions(): StabilityAdminAction[] {
  return ['refresh_stability_summary']
}
