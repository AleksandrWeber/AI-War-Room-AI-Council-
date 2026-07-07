import type {
  WarrantabilityvaultizabilityAdminAction,
  WarrantabilityvaultizabilityAdminRecord,
  WarrantabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceWarrantabilityvaultizabilityDomainInventory = {
  domain: WarrantabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildWarrantabilityvaultizabilityAdminRecords(
  inventory: WorkspaceWarrantabilityvaultizabilityDomainInventory[],
): WarrantabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildWarrantabilityvaultizabilityAdminStats(input: {
  records: WarrantabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): WarrantabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const warrantabilityvaultizabilityPercent =
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
    warrantabilityvaultizabilityPercent,
  }
}

export function getWarrantabilityvaultizabilityAdminGuidance(input: {
  stats: WarrantabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect warrantabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial warrantabilityvaultizability coverage and refresh the warrantabilityvaultizability summary.'
  }

  if (input.stats.warrantabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification warrantabilityvaultizability below the 95% target and refresh the warrantabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace warrantabilityvaultizability coverage and refresh the warrantabilityvaultizability summary.'
}

export function resolveWarrantabilityvaultizabilityAdminActions(): WarrantabilityvaultizabilityAdminAction[] {
  return ['refresh_warrantabilityvaultizability_summary']
}
