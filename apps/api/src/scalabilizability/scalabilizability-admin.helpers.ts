import type {
  ScalabilizabilityAdminAction,
  ScalabilizabilityAdminRecord,
  ScalabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceScalabilizabilityDomainInventory = {
  domain: ScalabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildScalabilizabilityAdminRecords(
  inventory: WorkspaceScalabilizabilityDomainInventory[],
): ScalabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildScalabilizabilityAdminStats(input: {
  records: ScalabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ScalabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const scalabilizabilityPercent =
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
    scalabilizabilityPercent,
  }
}

export function getScalabilizabilityAdminGuidance(input: {
  stats: ScalabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect scalabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial scalabilizability coverage and refresh the scalabilizability summary.'
  }

  if (input.stats.scalabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan scalabilizability below the 95% target and refresh the scalabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace scalabilizability coverage and refresh the scalabilizability summary.'
}

export function resolveScalabilizabilityAdminActions(): ScalabilizabilityAdminAction[] {
  return ['refresh_scalabilizability_summary']
}
