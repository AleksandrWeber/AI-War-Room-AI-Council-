import type {
  AssessabilityvaultizabilityAdminAction,
  AssessabilityvaultizabilityAdminRecord,
  AssessabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAssessabilityvaultizabilityDomainInventory = {
  domain: AssessabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAssessabilityvaultizabilityAdminRecords(
  inventory: WorkspaceAssessabilityvaultizabilityDomainInventory[],
): AssessabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAssessabilityvaultizabilityAdminStats(input: {
  records: AssessabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AssessabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const assessabilityvaultizabilityPercent =
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
    assessabilityvaultizabilityPercent,
  }
}

export function getAssessabilityvaultizabilityAdminGuidance(input: {
  stats: AssessabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect assessabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial assessabilityvaultizability coverage and refresh the assessabilityvaultizability summary.'
  }

  if (input.stats.assessabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice assessabilityvaultizability below the 95% target and refresh the assessabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace assessabilityvaultizability coverage and refresh the assessabilityvaultizability summary.'
}

export function resolveAssessabilityvaultizabilityAdminActions(): AssessabilityvaultizabilityAdminAction[] {
  return ['refresh_assessabilityvaultizability_summary']
}
