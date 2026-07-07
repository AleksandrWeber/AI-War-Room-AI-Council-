import type {
  TunabilityvaultizabilityAdminAction,
  TunabilityvaultizabilityAdminRecord,
  TunabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceTunabilityvaultizabilityDomainInventory = {
  domain: TunabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildTunabilityvaultizabilityAdminRecords(
  inventory: WorkspaceTunabilityvaultizabilityDomainInventory[],
): TunabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildTunabilityvaultizabilityAdminStats(input: {
  records: TunabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): TunabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const tunabilityvaultizabilityPercent =
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
    tunabilityvaultizabilityPercent,
  }
}

export function getTunabilityvaultizabilityAdminGuidance(input: {
  stats: TunabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect tunabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial tunabilityvaultizability coverage and refresh the tunabilityvaultizability summary.'
  }

  if (input.stats.tunabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan tunabilityvaultizability below the 95% target and refresh the tunabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace tunabilityvaultizability coverage and refresh the tunabilityvaultizability summary.'
}

export function resolveTunabilityvaultizabilityAdminActions(): TunabilityvaultizabilityAdminAction[] {
  return ['refresh_tunabilityvaultizability_summary']
}
