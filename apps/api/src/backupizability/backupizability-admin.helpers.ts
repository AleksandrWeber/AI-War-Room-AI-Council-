import type {
  BackupizabilityAdminAction,
  BackupizabilityAdminRecord,
  BackupizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceBackupizabilityDomainInventory = {
  domain: BackupizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildBackupizabilityAdminRecords(
  inventory: WorkspaceBackupizabilityDomainInventory[],
): BackupizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildBackupizabilityAdminStats(input: {
  records: BackupizabilityAdminRecord[]
  postgresConnectivity: boolean
}): BackupizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const backupizabilityPercent =
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
    backupizabilityPercent,
  }
}

export function getBackupizabilityAdminGuidance(input: {
  stats: BackupizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect backupizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial backupizability coverage and refresh the backupizability summary.'
  }

  if (input.stats.backupizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage backupizability below the 95% target and refresh the backupizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace backupizability coverage and refresh the backupizability summary.'
}

export function resolveBackupizabilityAdminActions(): BackupizabilityAdminAction[] {
  return ['refresh_backupizability_summary']
}
