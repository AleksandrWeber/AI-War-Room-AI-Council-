import type {
  DurabilityAdminAction,
  DurabilityAdminRecord,
  DurabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDurabilityDomainInventory = {
  domain: DurabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDurabilityAdminRecords(
  inventory: WorkspaceDurabilityDomainInventory[],
): DurabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDurabilityAdminStats(input: {
  records: DurabilityAdminRecord[]
  postgresConnectivity: boolean
}): DurabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const artifacts =
    input.records.find((record) => record.domain === 'artifacts')?.recordCount ??
    0
  const durabilityPercent =
    completedRuns === 0
      ? 100
      : Math.min(100, Math.round((artifacts / completedRuns) * 100))

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    durabilityPercent,
  }
}

export function getDurabilityAdminGuidance(input: {
  stats: DurabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect durability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial durability coverage and refresh the durability summary.'
  }

  if (input.stats.durabilityPercent < 95) {
    return 'Workspace owners and admins can inspect artifact durability below the 95% target and refresh the durability summary.'
  }

  return 'Workspace owners and admins can inspect workspace durability coverage and refresh the durability summary.'
}

export function resolveDurabilityAdminActions(): DurabilityAdminAction[] {
  return ['refresh_durability_summary']
}
