import type {
  InferencizabilityAdminAction,
  InferencizabilityAdminRecord,
  InferencizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceInferencizabilityDomainInventory = {
  domain: InferencizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildInferencizabilityAdminRecords(
  inventory: WorkspaceInferencizabilityDomainInventory[],
): InferencizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildInferencizabilityAdminStats(input: {
  records: InferencizabilityAdminRecord[]
  postgresConnectivity: boolean
}): InferencizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const inferencizabilityPercent =
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
    inferencizabilityPercent,
  }
}

export function getInferencizabilityAdminGuidance(input: {
  stats: InferencizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect inferencizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial inferencizability coverage and refresh the inferencizability summary.'
  }

  if (input.stats.inferencizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice inferencizability below the 95% target and refresh the inferencizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace inferencizability coverage and refresh the inferencizability summary.'
}

export function resolveInferencizabilityAdminActions(): InferencizabilityAdminAction[] {
  return ['refresh_inferencizability_summary']
}
