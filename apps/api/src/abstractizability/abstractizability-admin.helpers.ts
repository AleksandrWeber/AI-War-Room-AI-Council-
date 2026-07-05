import type {
  AbstractizabilityAdminAction,
  AbstractizabilityAdminRecord,
  AbstractizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAbstractizabilityDomainInventory = {
  domain: AbstractizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAbstractizabilityAdminRecords(
  inventory: WorkspaceAbstractizabilityDomainInventory[],
): AbstractizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAbstractizabilityAdminStats(input: {
  records: AbstractizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AbstractizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const abstractizabilityPercent =
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
    abstractizabilityPercent,
  }
}

export function getAbstractizabilityAdminGuidance(input: {
  stats: AbstractizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect abstractizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial abstractizability coverage and refresh the abstractizability summary.'
  }

  if (input.stats.abstractizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan abstractizability below the 95% target and refresh the abstractizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace abstractizability coverage and refresh the abstractizability summary.'
}

export function resolveAbstractizabilityAdminActions(): AbstractizabilityAdminAction[] {
  return ['refresh_abstractizability_summary']
}
