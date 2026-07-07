import type {
  InterchangeabilityvaultizabilityAdminAction,
  InterchangeabilityvaultizabilityAdminRecord,
  InterchangeabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceInterchangeabilityvaultizabilityDomainInventory = {
  domain: InterchangeabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildInterchangeabilityvaultizabilityAdminRecords(
  inventory: WorkspaceInterchangeabilityvaultizabilityDomainInventory[],
): InterchangeabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildInterchangeabilityvaultizabilityAdminStats(input: {
  records: InterchangeabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): InterchangeabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const interchangeabilityvaultizabilityPercent =
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
    interchangeabilityvaultizabilityPercent,
  }
}

export function getInterchangeabilityvaultizabilityAdminGuidance(input: {
  stats: InterchangeabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect interchangeabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial interchangeabilityvaultizability coverage and refresh the interchangeabilityvaultizability summary.'
  }

  if (input.stats.interchangeabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key interchangeabilityvaultizability below the 95% target and refresh the interchangeabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace interchangeabilityvaultizability coverage and refresh the interchangeabilityvaultizability summary.'
}

export function resolveInterchangeabilityvaultizabilityAdminActions(): InterchangeabilityvaultizabilityAdminAction[] {
  return ['refresh_interchangeabilityvaultizability_summary']
}
