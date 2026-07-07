import type {
  TrustworthinessvaultizabilityAdminAction,
  TrustworthinessvaultizabilityAdminRecord,
  TrustworthinessvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTrustworthinessvaultizabilityDomainInventory = {
  domain: TrustworthinessvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTrustworthinessvaultizabilityAdminRecords(
  inventory: WorkspaceTrustworthinessvaultizabilityDomainInventory[],
): TrustworthinessvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTrustworthinessvaultizabilityAdminStats(input: {
  records: TrustworthinessvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TrustworthinessvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const trustworthinessvaultizabilityPercent =
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
    trustworthinessvaultizabilityPercent,
  }
}

export function getTrustworthinessvaultizabilityAdminGuidance(input: {
  stats: TrustworthinessvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect trustworthinessvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial trustworthinessvaultizability coverage and refresh the trustworthinessvaultizability summary.'
  }

  if (input.stats.trustworthinessvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification trustworthinessvaultizability below the 95% target and refresh the trustworthinessvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace trustworthinessvaultizability coverage and refresh the trustworthinessvaultizability summary.'
}

export function resolveTrustworthinessvaultizabilityAdminActions(): TrustworthinessvaultizabilityAdminAction[] {
  return ['refresh_trustworthinessvaultizability_summary']
}
