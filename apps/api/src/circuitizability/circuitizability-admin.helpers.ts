import type {
  CircuitizabilityAdminAction,
  CircuitizabilityAdminRecord,
  CircuitizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCircuitizabilityDomainInventory = {
  domain: CircuitizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCircuitizabilityAdminRecords(
  inventory: WorkspaceCircuitizabilityDomainInventory[],
): CircuitizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCircuitizabilityAdminStats(input: {
  records: CircuitizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CircuitizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const circuitizabilityPercent =
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
    circuitizabilityPercent,
  }
}

export function getCircuitizabilityAdminGuidance(input: {
  stats: CircuitizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect circuitizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial circuitizability coverage and refresh the circuitizability summary.'
  }

  if (input.stats.circuitizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice circuitizability below the 95% target and refresh the circuitizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace circuitizability coverage and refresh the circuitizability summary.'
}

export function resolveCircuitizabilityAdminActions(): CircuitizabilityAdminAction[] {
  return ['refresh_circuitizability_summary']
}
