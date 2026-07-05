import type {
  GeneralizabilityAdminAction,
  GeneralizabilityAdminRecord,
  GeneralizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceGeneralizabilityDomainInventory = {
  domain: GeneralizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildGeneralizabilityAdminRecords(
  inventory: WorkspaceGeneralizabilityDomainInventory[],
): GeneralizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildGeneralizabilityAdminStats(input: {
  records: GeneralizabilityAdminRecord[]
  postgresConnectivity: boolean
}): GeneralizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const generalizabilityPercent =
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
    generalizabilityPercent,
  }
}

export function getGeneralizabilityAdminGuidance(input: {
  stats: GeneralizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect generalizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial generalizability coverage and refresh the generalizability summary.'
  }

  if (input.stats.generalizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage generalizability below the 95% target and refresh the generalizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace generalizability coverage and refresh the generalizability summary.'
}

export function resolveGeneralizabilityAdminActions(): GeneralizabilityAdminAction[] {
  return ['refresh_generalizability_summary']
}
