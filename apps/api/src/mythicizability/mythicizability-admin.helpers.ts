import type {
  MythicizabilityAdminAction,
  MythicizabilityAdminRecord,
  MythicizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMythicizabilityDomainInventory = {
  domain: MythicizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMythicizabilityAdminRecords(
  inventory: WorkspaceMythicizabilityDomainInventory[],
): MythicizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMythicizabilityAdminStats(input: {
  records: MythicizabilityAdminRecord[]
  postgresConnectivity: boolean
}): MythicizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'artifacts')
      ?.recordCount ?? 0
  const mythicizabilityPercent =
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
    mythicizabilityPercent,
  }
}

export function getMythicizabilityAdminGuidance(input: {
  stats: MythicizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect mythicizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial mythicizability coverage and refresh the mythicizability summary.'
  }

  if (input.stats.mythicizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect artifact mythicizability below the 95% target and refresh the mythicizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace mythicizability coverage and refresh the mythicizability summary.'
}

export function resolveMythicizabilityAdminActions(): MythicizabilityAdminAction[] {
  return ['refresh_mythicizability_summary']
}
