import type {
  StylizabilityAdminAction,
  StylizabilityAdminRecord,
  StylizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceStylizabilityDomainInventory = {
  domain: StylizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildStylizabilityAdminRecords(
  inventory: WorkspaceStylizabilityDomainInventory[],
): StylizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildStylizabilityAdminStats(input: {
  records: StylizabilityAdminRecord[]
  postgresConnectivity: boolean
}): StylizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const stylizabilityPercent =
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
    stylizabilityPercent,
  }
}

export function getStylizabilityAdminGuidance(input: {
  stats: StylizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect stylizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial stylizability coverage and refresh the stylizability summary.'
  }

  if (input.stats.stylizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice stylizability below the 95% target and refresh the stylizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace stylizability coverage and refresh the stylizability summary.'
}

export function resolveStylizabilityAdminActions(): StylizabilityAdminAction[] {
  return ['refresh_stylizability_summary']
}
