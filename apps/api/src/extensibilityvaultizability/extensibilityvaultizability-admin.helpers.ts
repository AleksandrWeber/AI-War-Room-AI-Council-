import type {
  ExtensibilityvaultizabilityAdminAction,
  ExtensibilityvaultizabilityAdminRecord,
  ExtensibilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceExtensibilityvaultizabilityDomainInventory = {
  domain: ExtensibilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildExtensibilityvaultizabilityAdminRecords(
  inventory: WorkspaceExtensibilityvaultizabilityDomainInventory[],
): ExtensibilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildExtensibilityvaultizabilityAdminStats(input: {
  records: ExtensibilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ExtensibilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const extensibilityvaultizabilityPercent =
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
    extensibilityvaultizabilityPercent,
  }
}

export function getExtensibilityvaultizabilityAdminGuidance(input: {
  stats: ExtensibilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect extensibilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial extensibilityvaultizability coverage and refresh the extensibilityvaultizability summary.'
  }

  if (input.stats.extensibilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan extensibilityvaultizability below the 95% target and refresh the extensibilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace extensibilityvaultizability coverage and refresh the extensibilityvaultizability summary.'
}

export function resolveExtensibilityvaultizabilityAdminActions(): ExtensibilityvaultizabilityAdminAction[] {
  return ['refresh_extensibilityvaultizability_summary']
}
