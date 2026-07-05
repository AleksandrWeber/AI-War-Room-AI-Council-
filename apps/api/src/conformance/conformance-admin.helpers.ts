import type {
  ConformanceAdminAction,
  ConformanceAdminRecord,
  ConformanceAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceConformanceDomainInventory = {
  domain: ConformanceAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildConformanceAdminRecords(
  inventory: WorkspaceConformanceDomainInventory[],
): ConformanceAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildConformanceAdminStats(input: {
  records: ConformanceAdminRecord[]
  postgresConnectivity: boolean
}): ConformanceAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const conformancePercent =
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
    conformancePercent,
  }
}

export function getConformanceAdminGuidance(input: {
  stats: ConformanceAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect conformance metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial conformance coverage and refresh the conformance summary.'
  }

  if (input.stats.conformancePercent < 95) {
    return 'Workspace owners and admins can inspect shield scan conformance below the 95% target and refresh the conformance summary.'
  }

  return 'Workspace owners and admins can inspect workspace conformance coverage and refresh the conformance summary.'
}

export function resolveConformanceAdminActions(): ConformanceAdminAction[] {
  return ['refresh_conformance_summary']
}
