import type {
  FalsifiizabilityAdminAction,
  FalsifiizabilityAdminRecord,
  FalsifiizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceFalsifiizabilityDomainInventory = {
  domain: FalsifiizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildFalsifiizabilityAdminRecords(
  inventory: WorkspaceFalsifiizabilityDomainInventory[],
): FalsifiizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildFalsifiizabilityAdminStats(input: {
  records: FalsifiizabilityAdminRecord[]
  postgresConnectivity: boolean
}): FalsifiizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const falsifiizabilityPercent =
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
    falsifiizabilityPercent,
  }
}

export function getFalsifiizabilityAdminGuidance(input: {
  stats: FalsifiizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect falsifiizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial falsifiizability coverage and refresh the falsifiizability summary.'
  }

  if (input.stats.falsifiizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification falsifiizability below the 95% target and refresh the falsifiizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace falsifiizability coverage and refresh the falsifiizability summary.'
}

export function resolveFalsifiizabilityAdminActions(): FalsifiizabilityAdminAction[] {
  return ['refresh_falsifiizability_summary']
}
