import type {
  InductizabilityAdminAction,
  InductizabilityAdminRecord,
  InductizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceInductizabilityDomainInventory = {
  domain: InductizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildInductizabilityAdminRecords(
  inventory: WorkspaceInductizabilityDomainInventory[],
): InductizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildInductizabilityAdminStats(input: {
  records: InductizabilityAdminRecord[]
  postgresConnectivity: boolean
}): InductizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const inductizabilityPercent =
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
    inductizabilityPercent,
  }
}

export function getInductizabilityAdminGuidance(input: {
  stats: InductizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect inductizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial inductizability coverage and refresh the inductizability summary.'
  }

  if (input.stats.inductizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan inductizability below the 95% target and refresh the inductizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace inductizability coverage and refresh the inductizability summary.'
}

export function resolveInductizabilityAdminActions(): InductizabilityAdminAction[] {
  return ['refresh_inductizability_summary']
}
