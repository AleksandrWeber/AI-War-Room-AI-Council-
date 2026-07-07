import type {
  OperabilityvaultizabilityAdminAction,
  OperabilityvaultizabilityAdminRecord,
  OperabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceOperabilityvaultizabilityDomainInventory = {
  domain: OperabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildOperabilityvaultizabilityAdminRecords(
  inventory: WorkspaceOperabilityvaultizabilityDomainInventory[],
): OperabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildOperabilityvaultizabilityAdminStats(input: {
  records: OperabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): OperabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const operabilityvaultizabilityPercent =
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
    operabilityvaultizabilityPercent,
  }
}

export function getOperabilityvaultizabilityAdminGuidance(input: {
  stats: OperabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect operabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial operabilityvaultizability coverage and refresh the operabilityvaultizability summary.'
  }

  if (input.stats.operabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key operabilityvaultizability below the 95% target and refresh the operabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace operabilityvaultizability coverage and refresh the operabilityvaultizability summary.'
}

export function resolveOperabilityvaultizabilityAdminActions(): OperabilityvaultizabilityAdminAction[] {
  return ['refresh_operabilityvaultizability_summary']
}
