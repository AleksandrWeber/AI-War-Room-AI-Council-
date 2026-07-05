import type {
  DemonstrabilityAdminAction,
  DemonstrabilityAdminRecord,
  DemonstrabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDemonstrabilityDomainInventory = {
  domain: DemonstrabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDemonstrabilityAdminRecords(
  inventory: WorkspaceDemonstrabilityDomainInventory[],
): DemonstrabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDemonstrabilityAdminStats(input: {
  records: DemonstrabilityAdminRecord[]
  postgresConnectivity: boolean
}): DemonstrabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'run_workflows')
      ?.recordCount ?? 0
  const demonstrabilityPercent =
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
    demonstrabilityPercent,
  }
}

export function getDemonstrabilityAdminGuidance(input: {
  stats: DemonstrabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect demonstrability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial demonstrability coverage and refresh the demonstrability summary.'
  }

  if (input.stats.demonstrabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workflow demonstrability below the 95% target and refresh the demonstrability summary.'
  }

  return 'Workspace owners and admins can inspect workspace demonstrability coverage and refresh the demonstrability summary.'
}

export function resolveDemonstrabilityAdminActions(): DemonstrabilityAdminAction[] {
  return ['refresh_demonstrability_summary']
}
