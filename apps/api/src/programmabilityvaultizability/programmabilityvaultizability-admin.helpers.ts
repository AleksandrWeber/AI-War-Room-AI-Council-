import type {
  ProgrammabilityvaultizabilityAdminAction,
  ProgrammabilityvaultizabilityAdminRecord,
  ProgrammabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceProgrammabilityvaultizabilityDomainInventory = {
  domain: ProgrammabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildProgrammabilityvaultizabilityAdminRecords(
  inventory: WorkspaceProgrammabilityvaultizabilityDomainInventory[],
): ProgrammabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildProgrammabilityvaultizabilityAdminStats(input: {
  records: ProgrammabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ProgrammabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const programmabilityvaultizabilityPercent =
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
    programmabilityvaultizabilityPercent,
  }
}

export function getProgrammabilityvaultizabilityAdminGuidance(input: {
  stats: ProgrammabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect programmabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial programmabilityvaultizability coverage and refresh the programmabilityvaultizability summary.'
  }

  if (input.stats.programmabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice programmabilityvaultizability below the 95% target and refresh the programmabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace programmabilityvaultizability coverage and refresh the programmabilityvaultizability summary.'
}

export function resolveProgrammabilityvaultizabilityAdminActions(): ProgrammabilityvaultizabilityAdminAction[] {
  return ['refresh_programmabilityvaultizability_summary']
}
