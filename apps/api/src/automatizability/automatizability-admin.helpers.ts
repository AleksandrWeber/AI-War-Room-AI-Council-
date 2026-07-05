import type {
  AutomatizabilityAdminAction,
  AutomatizabilityAdminRecord,
  AutomatizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAutomatizabilityDomainInventory = {
  domain: AutomatizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAutomatizabilityAdminRecords(
  inventory: WorkspaceAutomatizabilityDomainInventory[],
): AutomatizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAutomatizabilityAdminStats(input: {
  records: AutomatizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AutomatizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const automatizabilityPercent =
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
    automatizabilityPercent,
  }
}

export function getAutomatizabilityAdminGuidance(input: {
  stats: AutomatizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect automatizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial automatizability coverage and refresh the automatizability summary.'
  }

  if (input.stats.automatizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key automatizability below the 95% target and refresh the automatizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace automatizability coverage and refresh the automatizability summary.'
}

export function resolveAutomatizabilityAdminActions(): AutomatizabilityAdminAction[] {
  return ['refresh_automatizability_summary']
}
