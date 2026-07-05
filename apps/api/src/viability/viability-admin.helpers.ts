import type {
  ViabilityAdminAction,
  ViabilityAdminRecord,
  ViabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceViabilityDomainInventory = {
  domain: ViabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildViabilityAdminRecords(
  inventory: WorkspaceViabilityDomainInventory[],
): ViabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildViabilityAdminStats(input: {
  records: ViabilityAdminRecord[]
  postgresConnectivity: boolean
}): ViabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const viabilityPercent =
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
    viabilityPercent,
  }
}

export function getViabilityAdminGuidance(input: {
  stats: ViabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect viability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial viability coverage and refresh the viability summary.'
  }

  if (input.stats.viabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice viability below the 95% target and refresh the viability summary.'
  }

  return 'Workspace owners and admins can inspect workspace viability coverage and refresh the viability summary.'
}

export function resolveViabilityAdminActions(): ViabilityAdminAction[] {
  return ['refresh_viability_summary']
}
