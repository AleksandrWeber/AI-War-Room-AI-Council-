import type {
  ThreatizabilityAdminAction,
  ThreatizabilityAdminRecord,
  ThreatizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceThreatizabilityDomainInventory = {
  domain: ThreatizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildThreatizabilityAdminRecords(
  inventory: WorkspaceThreatizabilityDomainInventory[],
): ThreatizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildThreatizabilityAdminStats(input: {
  records: ThreatizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ThreatizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const threatizabilityPercent =
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
    threatizabilityPercent,
  }
}

export function getThreatizabilityAdminGuidance(input: {
  stats: ThreatizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect threatizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial threatizability coverage and refresh the threatizability summary.'
  }

  if (input.stats.threatizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice threatizability below the 95% target and refresh the threatizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace threatizability coverage and refresh the threatizability summary.'
}

export function resolveThreatizabilityAdminActions(): ThreatizabilityAdminAction[] {
  return ['refresh_threatizability_summary']
}
