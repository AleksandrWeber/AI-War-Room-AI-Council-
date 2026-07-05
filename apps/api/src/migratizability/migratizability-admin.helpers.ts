import type {
  MigratizabilityAdminAction,
  MigratizabilityAdminRecord,
  MigratizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMigratizabilityDomainInventory = {
  domain: MigratizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMigratizabilityAdminRecords(
  inventory: WorkspaceMigratizabilityDomainInventory[],
): MigratizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMigratizabilityAdminStats(input: {
  records: MigratizabilityAdminRecord[]
  postgresConnectivity: boolean
}): MigratizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_usage_limits')
      ?.recordCount ?? 0
  const migratizabilityPercent =
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
    migratizabilityPercent,
  }
}

export function getMigratizabilityAdminGuidance(input: {
  stats: MigratizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect migratizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial migratizability coverage and refresh the migratizability summary.'
  }

  if (input.stats.migratizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workspace limit migratizability below the 95% target and refresh the migratizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace migratizability coverage and refresh the migratizability summary.'
}

export function resolveMigratizabilityAdminActions(): MigratizabilityAdminAction[] {
  return ['refresh_migratizability_summary']
}
