import type {
  DiscoverabilityvaultizabilityAdminAction,
  DiscoverabilityvaultizabilityAdminRecord,
  DiscoverabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDiscoverabilityvaultizabilityDomainInventory = {
  domain: DiscoverabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDiscoverabilityvaultizabilityAdminRecords(
  inventory: WorkspaceDiscoverabilityvaultizabilityDomainInventory[],
): DiscoverabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDiscoverabilityvaultizabilityAdminStats(input: {
  records: DiscoverabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DiscoverabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const discoverabilityvaultizabilityPercent =
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
    discoverabilityvaultizabilityPercent,
  }
}

export function getDiscoverabilityvaultizabilityAdminGuidance(input: {
  stats: DiscoverabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect discoverabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial discoverabilityvaultizability coverage and refresh the discoverabilityvaultizability summary.'
  }

  if (input.stats.discoverabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan discoverabilityvaultizability below the 95% target and refresh the discoverabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace discoverabilityvaultizability coverage and refresh the discoverabilityvaultizability summary.'
}

export function resolveDiscoverabilityvaultizabilityAdminActions(): DiscoverabilityvaultizabilityAdminAction[] {
  return ['refresh_discoverabilityvaultizability_summary']
}
