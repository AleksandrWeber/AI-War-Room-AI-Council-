import type {
  TrustworthinessAdminAction,
  TrustworthinessAdminRecord,
  TrustworthinessAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTrustworthinessDomainInventory = {
  domain: TrustworthinessAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTrustworthinessAdminRecords(
  inventory: WorkspaceTrustworthinessDomainInventory[],
): TrustworthinessAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTrustworthinessAdminStats(input: {
  records: TrustworthinessAdminRecord[]
  postgresConnectivity: boolean
}): TrustworthinessAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const trustworthinessPercent =
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
    trustworthinessPercent,
  }
}

export function getTrustworthinessAdminGuidance(input: {
  stats: TrustworthinessAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect trustworthiness metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial trustworthiness coverage and refresh the trustworthiness summary.'
  }

  if (input.stats.trustworthinessPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan trustworthiness below the 95% target and refresh the trustworthiness summary.'
  }

  return 'Workspace owners and admins can inspect workspace trustworthiness coverage and refresh the trustworthiness summary.'
}

export function resolveTrustworthinessAdminActions(): TrustworthinessAdminAction[] {
  return ['refresh_trustworthiness_summary']
}
