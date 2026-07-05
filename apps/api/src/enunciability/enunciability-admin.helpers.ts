import type {
  EnunciabilityAdminAction,
  EnunciabilityAdminRecord,
  EnunciabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceEnunciabilityDomainInventory = {
  domain: EnunciabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildEnunciabilityAdminRecords(
  inventory: WorkspaceEnunciabilityDomainInventory[],
): EnunciabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildEnunciabilityAdminStats(input: {
  records: EnunciabilityAdminRecord[]
  postgresConnectivity: boolean
}): EnunciabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const enunciabilityPercent =
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
    enunciabilityPercent,
  }
}

export function getEnunciabilityAdminGuidance(input: {
  stats: EnunciabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect enunciability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial enunciability coverage and refresh the enunciability summary.'
  }

  if (input.stats.enunciabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification enunciability below the 95% target and refresh the enunciability summary.'
  }

  return 'Workspace owners and admins can inspect workspace enunciability coverage and refresh the enunciability summary.'
}

export function resolveEnunciabilityAdminActions(): EnunciabilityAdminAction[] {
  return ['refresh_enunciability_summary']
}
