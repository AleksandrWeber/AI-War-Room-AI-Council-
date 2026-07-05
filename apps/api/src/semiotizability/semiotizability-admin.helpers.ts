import type {
  SemiotizabilityAdminAction,
  SemiotizabilityAdminRecord,
  SemiotizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSemiotizabilityDomainInventory = {
  domain: SemiotizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSemiotizabilityAdminRecords(
  inventory: WorkspaceSemiotizabilityDomainInventory[],
): SemiotizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSemiotizabilityAdminStats(input: {
  records: SemiotizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SemiotizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const semiotizabilityPercent =
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
    semiotizabilityPercent,
  }
}

export function getSemiotizabilityAdminGuidance(input: {
  stats: SemiotizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect semiotizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial semiotizability coverage and refresh the semiotizability summary.'
  }

  if (input.stats.semiotizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan semiotizability below the 95% target and refresh the semiotizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace semiotizability coverage and refresh the semiotizability summary.'
}

export function resolveSemiotizabilityAdminActions(): SemiotizabilityAdminAction[] {
  return ['refresh_semiotizability_summary']
}
