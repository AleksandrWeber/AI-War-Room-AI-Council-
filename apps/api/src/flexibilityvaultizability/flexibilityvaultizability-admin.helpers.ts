import type {
  FlexibilityvaultizabilityAdminAction,
  FlexibilityvaultizabilityAdminRecord,
  FlexibilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceFlexibilityvaultizabilityDomainInventory = {
  domain: FlexibilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildFlexibilityvaultizabilityAdminRecords(
  inventory: WorkspaceFlexibilityvaultizabilityDomainInventory[],
): FlexibilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildFlexibilityvaultizabilityAdminStats(input: {
  records: FlexibilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): FlexibilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const flexibilityvaultizabilityPercent =
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
    flexibilityvaultizabilityPercent,
  }
}

export function getFlexibilityvaultizabilityAdminGuidance(input: {
  stats: FlexibilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect flexibilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial flexibilityvaultizability coverage and refresh the flexibilityvaultizability summary.'
  }

  if (input.stats.flexibilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key flexibilityvaultizability below the 95% target and refresh the flexibilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace flexibilityvaultizability coverage and refresh the flexibilityvaultizability summary.'
}

export function resolveFlexibilityvaultizabilityAdminActions(): FlexibilityvaultizabilityAdminAction[] {
  return ['refresh_flexibilityvaultizability_summary']
}
