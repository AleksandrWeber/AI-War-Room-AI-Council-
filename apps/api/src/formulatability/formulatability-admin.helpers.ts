import type {
  FormulatabilityAdminAction,
  FormulatabilityAdminRecord,
  FormulatabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceFormulatabilityDomainInventory = {
  domain: FormulatabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildFormulatabilityAdminRecords(
  inventory: WorkspaceFormulatabilityDomainInventory[],
): FormulatabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildFormulatabilityAdminStats(input: {
  records: FormulatabilityAdminRecord[]
  postgresConnectivity: boolean
}): FormulatabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const formulatabilityPercent =
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
    formulatabilityPercent,
  }
}

export function getFormulatabilityAdminGuidance(input: {
  stats: FormulatabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect formulatability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial formulatability coverage and refresh the formulatability summary.'
  }

  if (input.stats.formulatabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key formulatability below the 95% target and refresh the formulatability summary.'
  }

  return 'Workspace owners and admins can inspect workspace formulatability coverage and refresh the formulatability summary.'
}

export function resolveFormulatabilityAdminActions(): FormulatabilityAdminAction[] {
  return ['refresh_formulatability_summary']
}
