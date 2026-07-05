import type {
  ScannabilityAdminAction,
  ScannabilityAdminRecord,
  ScannabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceScannabilityDomainInventory = {
  domain: ScannabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildScannabilityAdminRecords(
  inventory: WorkspaceScannabilityDomainInventory[],
): ScannabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildScannabilityAdminStats(input: {
  records: ScannabilityAdminRecord[]
  postgresConnectivity: boolean
}): ScannabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const scannabilityPercent =
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
    scannabilityPercent,
  }
}

export function getScannabilityAdminGuidance(input: {
  stats: ScannabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect scannability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial scannability coverage and refresh the scannability summary.'
  }

  if (input.stats.scannabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan scannability below the 95% target and refresh the scannability summary.'
  }

  return 'Workspace owners and admins can inspect workspace scannability coverage and refresh the scannability summary.'
}

export function resolveScannabilityAdminActions(): ScannabilityAdminAction[] {
  return ['refresh_scannability_summary']
}
