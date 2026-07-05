import type {
  ScalabilityAdminAction,
  ScalabilityAdminRecord,
  ScalabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceScalabilityDomainInventory = {
  domain: ScalabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildScalabilityAdminRecords(
  inventory: WorkspaceScalabilityDomainInventory[],
): ScalabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildScalabilityAdminStats(input: {
  records: ScalabilityAdminRecord[]
  postgresConnectivity: boolean
}): ScalabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const activeRuns =
    input.records.find((record) => record.domain === 'active_runs')
      ?.recordCount ?? 0
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const totalRunSignals = activeRuns + completedRuns
  const scalabilityPercent =
    totalRunSignals === 0
      ? 100
      : Math.round((completedRuns / totalRunSignals) * 100)

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    scalabilityPercent,
  }
}

export function getScalabilityAdminGuidance(input: {
  stats: ScalabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect scalability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial scalability coverage and refresh the scalability summary.'
  }

  if (input.stats.scalabilityPercent < 95) {
    return 'Workspace owners and admins can inspect run scalability below the 95% target and refresh the scalability summary.'
  }

  return 'Workspace owners and admins can inspect workspace scalability coverage and refresh the scalability summary.'
}

export function resolveScalabilityAdminActions(): ScalabilityAdminAction[] {
  return ['refresh_scalability_summary']
}
