import type {
  OrchestrabilityvaultizabilityAdminAction,
  OrchestrabilityvaultizabilityAdminRecord,
  OrchestrabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceOrchestrabilityvaultizabilityDomainInventory = {
  domain: OrchestrabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildOrchestrabilityvaultizabilityAdminRecords(
  inventory: WorkspaceOrchestrabilityvaultizabilityDomainInventory[],
): OrchestrabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildOrchestrabilityvaultizabilityAdminStats(input: {
  records: OrchestrabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): OrchestrabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const orchestrabilityvaultizabilityPercent =
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
    orchestrabilityvaultizabilityPercent,
  }
}

export function getOrchestrabilityvaultizabilityAdminGuidance(input: {
  stats: OrchestrabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect orchestrabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial orchestrabilityvaultizability coverage and refresh the orchestrabilityvaultizability summary.'
  }

  if (input.stats.orchestrabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice orchestrabilityvaultizability below the 95% target and refresh the orchestrabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace orchestrabilityvaultizability coverage and refresh the orchestrabilityvaultizability summary.'
}

export function resolveOrchestrabilityvaultizabilityAdminActions(): OrchestrabilityvaultizabilityAdminAction[] {
  return ['refresh_orchestrabilityvaultizability_summary']
}
