import type {
  ConspicuousnessAdminAction,
  ConspicuousnessAdminRecord,
  ConspicuousnessAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceConspicuousnessDomainInventory = {
  domain: ConspicuousnessAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildConspicuousnessAdminRecords(
  inventory: WorkspaceConspicuousnessDomainInventory[],
): ConspicuousnessAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildConspicuousnessAdminStats(input: {
  records: ConspicuousnessAdminRecord[]
  postgresConnectivity: boolean
}): ConspicuousnessAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const conspicuousnessPercent =
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
    conspicuousnessPercent,
  }
}

export function getConspicuousnessAdminGuidance(input: {
  stats: ConspicuousnessAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect conspicuousness metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial conspicuousness coverage and refresh the conspicuousness summary.'
  }

  if (input.stats.conspicuousnessPercent < 95) {
    return 'Workspace owners and admins can inspect membership conspicuousness below the 95% target and refresh the conspicuousness summary.'
  }

  return 'Workspace owners and admins can inspect workspace conspicuousness coverage and refresh the conspicuousness summary.'
}

export function resolveConspicuousnessAdminActions(): ConspicuousnessAdminAction[] {
  return ['refresh_conspicuousness_summary']
}
