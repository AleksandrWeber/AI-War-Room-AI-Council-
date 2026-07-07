import type {
  LedgerizabilityAdminAction,
  LedgerizabilityAdminRecord,
  LedgerizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceLedgerizabilityDomainInventory = {
  domain: LedgerizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildLedgerizabilityAdminRecords(
  inventory: WorkspaceLedgerizabilityDomainInventory[],
): LedgerizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildLedgerizabilityAdminStats(input: {
  records: LedgerizabilityAdminRecord[]
  postgresConnectivity: boolean
}): LedgerizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const ledgerizabilityPercent =
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
    ledgerizabilityPercent,
  }
}

export function getLedgerizabilityAdminGuidance(input: {
  stats: LedgerizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect ledgerizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial ledgerizability coverage and refresh the ledgerizability summary.'
  }

  if (input.stats.ledgerizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan ledgerizability below the 95% target and refresh the ledgerizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace ledgerizability coverage and refresh the ledgerizability summary.'
}

export function resolveLedgerizabilityAdminActions(): LedgerizabilityAdminAction[] {
  return ['refresh_ledgerizability_summary']
}
