import type {
  ProgrammabilityAdminAction,
  ProgrammabilityAdminRecord,
  ProgrammabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceProgrammabilityDomainInventory = {
  domain: ProgrammabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildProgrammabilityAdminRecords(
  inventory: WorkspaceProgrammabilityDomainInventory[],
): ProgrammabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildProgrammabilityAdminStats(input: {
  records: ProgrammabilityAdminRecord[]
  postgresConnectivity: boolean
}): ProgrammabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'run_workflows')
      ?.recordCount ?? 0
  const programmabilityPercent =
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
    programmabilityPercent,
  }
}

export function getProgrammabilityAdminGuidance(input: {
  stats: ProgrammabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect programmability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial programmability coverage and refresh the programmability summary.'
  }

  if (input.stats.programmabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workflow programmability below the 95% target and refresh the programmability summary.'
  }

  return 'Workspace owners and admins can inspect workspace programmability coverage and refresh the programmability summary.'
}

export function resolveProgrammabilityAdminActions(): ProgrammabilityAdminAction[] {
  return ['refresh_programmability_summary']
}
