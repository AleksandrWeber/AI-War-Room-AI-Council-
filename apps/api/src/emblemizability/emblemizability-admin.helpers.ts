import type {
  EmblemizabilityAdminAction,
  EmblemizabilityAdminRecord,
  EmblemizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceEmblemizabilityDomainInventory = {
  domain: EmblemizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildEmblemizabilityAdminRecords(
  inventory: WorkspaceEmblemizabilityDomainInventory[],
): EmblemizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildEmblemizabilityAdminStats(input: {
  records: EmblemizabilityAdminRecord[]
  postgresConnectivity: boolean
}): EmblemizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const emblemizabilityPercent =
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
    emblemizabilityPercent,
  }
}

export function getEmblemizabilityAdminGuidance(input: {
  stats: EmblemizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect emblemizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial emblemizability coverage and refresh the emblemizability summary.'
  }

  if (input.stats.emblemizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification emblemizability below the 95% target and refresh the emblemizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace emblemizability coverage and refresh the emblemizability summary.'
}

export function resolveEmblemizabilityAdminActions(): EmblemizabilityAdminAction[] {
  return ['refresh_emblemizability_summary']
}
