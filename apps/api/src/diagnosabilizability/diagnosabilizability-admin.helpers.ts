import type {
  DiagnosabilizabilityAdminAction,
  DiagnosabilizabilityAdminRecord,
  DiagnosabilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDiagnosabilizabilityDomainInventory = {
  domain: DiagnosabilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDiagnosabilizabilityAdminRecords(
  inventory: WorkspaceDiagnosabilizabilityDomainInventory[],
): DiagnosabilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDiagnosabilizabilityAdminStats(input: {
  records: DiagnosabilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DiagnosabilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const diagnosabilizabilityPercent =
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
    diagnosabilizabilityPercent,
  }
}

export function getDiagnosabilizabilityAdminGuidance(input: {
  stats: DiagnosabilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect diagnosabilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial diagnosabilizability coverage and refresh the diagnosabilizability summary.'
  }

  if (input.stats.diagnosabilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice diagnosabilizability below the 95% target and refresh the diagnosabilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace diagnosabilizability coverage and refresh the diagnosabilizability summary.'
}

export function resolveDiagnosabilizabilityAdminActions(): DiagnosabilizabilityAdminAction[] {
  return ['refresh_diagnosabilizability_summary']
}
