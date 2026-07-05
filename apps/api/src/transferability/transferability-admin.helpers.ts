import type {
  TransferabilityAdminAction,
  TransferabilityAdminRecord,
  TransferabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTransferabilityDomainInventory = {
  domain: TransferabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTransferabilityAdminRecords(
  inventory: WorkspaceTransferabilityDomainInventory[],
): TransferabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTransferabilityAdminStats(input: {
  records: TransferabilityAdminRecord[]
  postgresConnectivity: boolean
}): TransferabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_records')
      ?.recordCount ?? 0
  const transferabilityPercent =
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
    transferabilityPercent,
  }
}

export function getTransferabilityAdminGuidance(input: {
  stats: TransferabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect transferability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial transferability coverage and refresh the transferability summary.'
  }

  if (input.stats.transferabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing record transferability below the 95% target and refresh the transferability summary.'
  }

  return 'Workspace owners and admins can inspect workspace transferability coverage and refresh the transferability summary.'
}

export function resolveTransferabilityAdminActions(): TransferabilityAdminAction[] {
  return ['refresh_transferability_summary']
}
