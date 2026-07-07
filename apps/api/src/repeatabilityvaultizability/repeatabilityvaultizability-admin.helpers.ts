import type {
  RepeatabilityvaultizabilityAdminAction,
  RepeatabilityvaultizabilityAdminRecord,
  RepeatabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRepeatabilityvaultizabilityDomainInventory = {
  domain: RepeatabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRepeatabilityvaultizabilityAdminRecords(
  inventory: WorkspaceRepeatabilityvaultizabilityDomainInventory[],
): RepeatabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRepeatabilityvaultizabilityAdminStats(input: {
  records: RepeatabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RepeatabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const repeatabilityvaultizabilityPercent =
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
    repeatabilityvaultizabilityPercent,
  }
}

export function getRepeatabilityvaultizabilityAdminGuidance(input: {
  stats: RepeatabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect repeatabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial repeatabilityvaultizability coverage and refresh the repeatabilityvaultizability summary.'
  }

  if (input.stats.repeatabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice repeatabilityvaultizability below the 95% target and refresh the repeatabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace repeatabilityvaultizability coverage and refresh the repeatabilityvaultizability summary.'
}

export function resolveRepeatabilityvaultizabilityAdminActions(): RepeatabilityvaultizabilityAdminAction[] {
  return ['refresh_repeatabilityvaultizability_summary']
}
