import type {
  IdentifiabilityvaultizabilityAdminAction,
  IdentifiabilityvaultizabilityAdminRecord,
  IdentifiabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceIdentifiabilityvaultizabilityDomainInventory = {
  domain: IdentifiabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildIdentifiabilityvaultizabilityAdminRecords(
  inventory: WorkspaceIdentifiabilityvaultizabilityDomainInventory[],
): IdentifiabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildIdentifiabilityvaultizabilityAdminStats(input: {
  records: IdentifiabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): IdentifiabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const identifiabilityvaultizabilityPercent =
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
    identifiabilityvaultizabilityPercent,
  }
}

export function getIdentifiabilityvaultizabilityAdminGuidance(input: {
  stats: IdentifiabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect identifiabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial identifiabilityvaultizability coverage and refresh the identifiabilityvaultizability summary.'
  }

  if (input.stats.identifiabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership identifiabilityvaultizability below the 95% target and refresh the identifiabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace identifiabilityvaultizability coverage and refresh the identifiabilityvaultizability summary.'
}

export function resolveIdentifiabilityvaultizabilityAdminActions(): IdentifiabilityvaultizabilityAdminAction[] {
  return ['refresh_identifiabilityvaultizability_summary']
}
