import type {
  TransferabilityvaultizabilityAdminAction,
  TransferabilityvaultizabilityAdminRecord,
  TransferabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTransferabilityvaultizabilityDomainInventory = {
  domain: TransferabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTransferabilityvaultizabilityAdminRecords(
  inventory: WorkspaceTransferabilityvaultizabilityDomainInventory[],
): TransferabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTransferabilityvaultizabilityAdminStats(input: {
  records: TransferabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TransferabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const transferabilityvaultizabilityPercent =
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
    transferabilityvaultizabilityPercent,
  }
}

export function getTransferabilityvaultizabilityAdminGuidance(input: {
  stats: TransferabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect transferabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial transferabilityvaultizability coverage and refresh the transferabilityvaultizability summary.'
  }

  if (input.stats.transferabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan transferabilityvaultizability below the 95% target and refresh the transferabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace transferabilityvaultizability coverage and refresh the transferabilityvaultizability summary.'
}

export function resolveTransferabilityvaultizabilityAdminActions(): TransferabilityvaultizabilityAdminAction[] {
  return ['refresh_transferabilityvaultizability_summary']
}
