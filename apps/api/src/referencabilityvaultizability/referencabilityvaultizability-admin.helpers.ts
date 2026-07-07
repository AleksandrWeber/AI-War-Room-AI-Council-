import type {
  ReferencabilityvaultizabilityAdminAction,
  ReferencabilityvaultizabilityAdminRecord,
  ReferencabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceReferencabilityvaultizabilityDomainInventory = {
  domain: ReferencabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildReferencabilityvaultizabilityAdminRecords(
  inventory: WorkspaceReferencabilityvaultizabilityDomainInventory[],
): ReferencabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildReferencabilityvaultizabilityAdminStats(input: {
  records: ReferencabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ReferencabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const referencabilityvaultizabilityPercent =
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
    referencabilityvaultizabilityPercent,
  }
}

export function getReferencabilityvaultizabilityAdminGuidance(input: {
  stats: ReferencabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect referencabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial referencabilityvaultizability coverage and refresh the referencabilityvaultizability summary.'
  }

  if (input.stats.referencabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice referencabilityvaultizability below the 95% target and refresh the referencabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace referencabilityvaultizability coverage and refresh the referencabilityvaultizability summary.'
}

export function resolveReferencabilityvaultizabilityAdminActions(): ReferencabilityvaultizabilityAdminAction[] {
  return ['refresh_referencabilityvaultizability_summary']
}
