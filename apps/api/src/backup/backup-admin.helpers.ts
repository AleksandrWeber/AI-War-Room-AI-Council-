import type {
  BackupAdminAction,
  BackupAdminRecord,
  BackupAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceBackupDomainInventory = {
  domain: BackupAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildBackupAdminRecords(
  inventory: WorkspaceBackupDomainInventory[],
): BackupAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildBackupAdminStats(input: {
  records: BackupAdminRecord[]
  postgresConnectivity: boolean
  redisBackedPersistence: boolean
}): BackupAdminStats {
  const recoverableDomains = input.records.filter(
    (record) => record.tableExists,
  ).length

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    recoverableDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    redisBackedPersistence: input.redisBackedPersistence,
  }
}

export function getBackupAdminGuidance(input: { stats: BackupAdminStats }) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect backup metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.recoverableDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial backup coverage and refresh the backup summary.'
  }

  return 'Workspace owners and admins can inspect workspace backup coverage and refresh the backup summary.'
}

export function resolveBackupAdminActions(): BackupAdminAction[] {
  return ['refresh_backup_summary']
}
