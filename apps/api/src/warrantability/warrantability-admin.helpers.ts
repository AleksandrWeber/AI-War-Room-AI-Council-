import type {
  WarrantabilityAdminAction,
  WarrantabilityAdminRecord,
  WarrantabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceWarrantabilityDomainInventory = {
  domain: WarrantabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildWarrantabilityAdminRecords(
  inventory: WorkspaceWarrantabilityDomainInventory[],
): WarrantabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildWarrantabilityAdminStats(input: {
  records: WarrantabilityAdminRecord[]
  postgresConnectivity: boolean
}): WarrantabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const warrantabilityPercent =
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
    warrantabilityPercent,
  }
}

export function getWarrantabilityAdminGuidance(input: {
  stats: WarrantabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect warrantability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial warrantability coverage and refresh the warrantability summary.'
  }

  if (input.stats.warrantabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan warrantability below the 95% target and refresh the warrantability summary.'
  }

  return 'Workspace owners and admins can inspect workspace warrantability coverage and refresh the warrantability summary.'
}

export function resolveWarrantabilityAdminActions(): WarrantabilityAdminAction[] {
  return ['refresh_warrantability_summary']
}
