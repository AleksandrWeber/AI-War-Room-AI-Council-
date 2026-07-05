import type {
  ValidityAdminAction,
  ValidityAdminRecord,
  ValidityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceValidityDomainInventory = {
  domain: ValidityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildValidityAdminRecords(
  inventory: WorkspaceValidityDomainInventory[],
): ValidityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildValidityAdminStats(input: {
  records: ValidityAdminRecord[]
  postgresConnectivity: boolean
}): ValidityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'agent_outputs')
      ?.recordCount ?? 0
  const validityPercent =
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
    validityPercent,
  }
}

export function getValidityAdminGuidance(input: {
  stats: ValidityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect validity metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial validity coverage and refresh the validity summary.'
  }

  if (input.stats.validityPercent < 95) {
    return 'Workspace owners and admins can inspect agent output validity below the 95% target and refresh the validity summary.'
  }

  return 'Workspace owners and admins can inspect workspace validity coverage and refresh the validity summary.'
}

export function resolveValidityAdminActions(): ValidityAdminAction[] {
  return ['refresh_validity_summary']
}
