import type {
  InspectabilityvaultizabilityAdminAction,
  InspectabilityvaultizabilityAdminRecord,
  InspectabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceInspectabilityvaultizabilityDomainInventory = {
  domain: InspectabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildInspectabilityvaultizabilityAdminRecords(
  inventory: WorkspaceInspectabilityvaultizabilityDomainInventory[],
): InspectabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildInspectabilityvaultizabilityAdminStats(input: {
  records: InspectabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): InspectabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const inspectabilityvaultizabilityPercent =
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
    inspectabilityvaultizabilityPercent,
  }
}

export function getInspectabilityvaultizabilityAdminGuidance(input: {
  stats: InspectabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect inspectabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial inspectabilityvaultizability coverage and refresh the inspectabilityvaultizability summary.'
  }

  if (input.stats.inspectabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key inspectabilityvaultizability below the 95% target and refresh the inspectabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace inspectabilityvaultizability coverage and refresh the inspectabilityvaultizability summary.'
}

export function resolveInspectabilityvaultizabilityAdminActions(): InspectabilityvaultizabilityAdminAction[] {
  return ['refresh_inspectabilityvaultizability_summary']
}
