import type {
  DefensibilityvaultizabilityAdminAction,
  DefensibilityvaultizabilityAdminRecord,
  DefensibilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDefensibilityvaultizabilityDomainInventory = {
  domain: DefensibilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDefensibilityvaultizabilityAdminRecords(
  inventory: WorkspaceDefensibilityvaultizabilityDomainInventory[],
): DefensibilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDefensibilityvaultizabilityAdminStats(input: {
  records: DefensibilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DefensibilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const defensibilityvaultizabilityPercent =
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
    defensibilityvaultizabilityPercent,
  }
}

export function getDefensibilityvaultizabilityAdminGuidance(input: {
  stats: DefensibilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect defensibilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial defensibilityvaultizability coverage and refresh the defensibilityvaultizability summary.'
  }

  if (input.stats.defensibilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice defensibilityvaultizability below the 95% target and refresh the defensibilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace defensibilityvaultizability coverage and refresh the defensibilityvaultizability summary.'
}

export function resolveDefensibilityvaultizabilityAdminActions(): DefensibilityvaultizabilityAdminAction[] {
  return ['refresh_defensibilityvaultizability_summary']
}
