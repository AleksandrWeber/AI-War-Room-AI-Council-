import type {
  ExtensibilizabilityAdminAction,
  ExtensibilizabilityAdminRecord,
  ExtensibilizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceExtensibilizabilityDomainInventory = {
  domain: ExtensibilizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildExtensibilizabilityAdminRecords(
  inventory: WorkspaceExtensibilizabilityDomainInventory[],
): ExtensibilizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildExtensibilizabilityAdminStats(input: {
  records: ExtensibilizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ExtensibilizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const extensibilizabilityPercent =
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
    extensibilizabilityPercent,
  }
}

export function getExtensibilizabilityAdminGuidance(input: {
  stats: ExtensibilizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect extensibilizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial extensibilizability coverage and refresh the extensibilizability summary.'
  }

  if (input.stats.extensibilizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice extensibilizability below the 95% target and refresh the extensibilizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace extensibilizability coverage and refresh the extensibilizability summary.'
}

export function resolveExtensibilizabilityAdminActions(): ExtensibilizabilityAdminAction[] {
  return ['refresh_extensibilizability_summary']
}
