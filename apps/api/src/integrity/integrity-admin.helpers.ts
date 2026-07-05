import type {
  IntegrityAdminAction,
  IntegrityAdminRecord,
  IntegrityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceIntegrityDomainInventory = {
  domain: IntegrityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildIntegrityAdminRecords(
  inventory: WorkspaceIntegrityDomainInventory[],
): IntegrityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildIntegrityAdminStats(input: {
  records: IntegrityAdminRecord[]
  postgresConnectivity: boolean
}): IntegrityAdminStats {
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
  const integrityPercent =
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
    integrityPercent,
  }
}

export function getIntegrityAdminGuidance(input: { stats: IntegrityAdminStats }) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect integrity metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial integrity coverage and refresh the integrity summary.'
  }

  if (input.stats.integrityPercent < 95) {
    return 'Workspace owners and admins can inspect run integrity below the 95% target and refresh the integrity summary.'
  }

  return 'Workspace owners and admins can inspect workspace integrity coverage and refresh the integrity summary.'
}

export function resolveIntegrityAdminActions(): IntegrityAdminAction[] {
  return ['refresh_integrity_summary']
}
