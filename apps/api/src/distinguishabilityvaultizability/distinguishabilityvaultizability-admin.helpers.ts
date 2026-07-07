import type {
  DistinguishabilityvaultizabilityAdminAction,
  DistinguishabilityvaultizabilityAdminRecord,
  DistinguishabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDistinguishabilityvaultizabilityDomainInventory = {
  domain: DistinguishabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDistinguishabilityvaultizabilityAdminRecords(
  inventory: WorkspaceDistinguishabilityvaultizabilityDomainInventory[],
): DistinguishabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDistinguishabilityvaultizabilityAdminStats(input: {
  records: DistinguishabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DistinguishabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const distinguishabilityvaultizabilityPercent =
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
    distinguishabilityvaultizabilityPercent,
  }
}

export function getDistinguishabilityvaultizabilityAdminGuidance(input: {
  stats: DistinguishabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect distinguishabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial distinguishabilityvaultizability coverage and refresh the distinguishabilityvaultizability summary.'
  }

  if (input.stats.distinguishabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan distinguishabilityvaultizability below the 95% target and refresh the distinguishabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace distinguishabilityvaultizability coverage and refresh the distinguishabilityvaultizability summary.'
}

export function resolveDistinguishabilityvaultizabilityAdminActions(): DistinguishabilityvaultizabilityAdminAction[] {
  return ['refresh_distinguishabilityvaultizability_summary']
}
