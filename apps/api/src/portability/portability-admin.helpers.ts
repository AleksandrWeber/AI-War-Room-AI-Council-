import type {
  PortabilityAdminAction,
  PortabilityAdminRecord,
  PortabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePortabilityDomainInventory = {
  domain: PortabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPortabilityAdminRecords(
  inventory: WorkspacePortabilityDomainInventory[],
): PortabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPortabilityAdminStats(input: {
  records: PortabilityAdminRecord[]
  postgresConnectivity: boolean
}): PortabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'artifacts')
      ?.recordCount ?? 0
  const portabilityPercent =
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
    portabilityPercent,
  }
}

export function getPortabilityAdminGuidance(input: {
  stats: PortabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect portability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial portability coverage and refresh the portability summary.'
  }

  if (input.stats.portabilityPercent < 95) {
    return 'Workspace owners and admins can inspect artifact portability below the 95% target and refresh the portability summary.'
  }

  return 'Workspace owners and admins can inspect workspace portability coverage and refresh the portability summary.'
}

export function resolvePortabilityAdminActions(): PortabilityAdminAction[] {
  return ['refresh_portability_summary']
}
