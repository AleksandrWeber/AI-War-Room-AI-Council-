import type {
  PragmatizabilityAdminAction,
  PragmatizabilityAdminRecord,
  PragmatizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePragmatizabilityDomainInventory = {
  domain: PragmatizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPragmatizabilityAdminRecords(
  inventory: WorkspacePragmatizabilityDomainInventory[],
): PragmatizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPragmatizabilityAdminStats(input: {
  records: PragmatizabilityAdminRecord[]
  postgresConnectivity: boolean
}): PragmatizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const pragmatizabilityPercent =
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
    pragmatizabilityPercent,
  }
}

export function getPragmatizabilityAdminGuidance(input: {
  stats: PragmatizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect pragmatizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial pragmatizability coverage and refresh the pragmatizability summary.'
  }

  if (input.stats.pragmatizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification pragmatizability below the 95% target and refresh the pragmatizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace pragmatizability coverage and refresh the pragmatizability summary.'
}

export function resolvePragmatizabilityAdminActions(): PragmatizabilityAdminAction[] {
  return ['refresh_pragmatizability_summary']
}
