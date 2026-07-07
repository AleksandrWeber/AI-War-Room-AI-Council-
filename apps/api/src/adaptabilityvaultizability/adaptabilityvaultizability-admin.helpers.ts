import type {
  AdaptabilityvaultizabilityAdminAction,
  AdaptabilityvaultizabilityAdminRecord,
  AdaptabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAdaptabilityvaultizabilityDomainInventory = {
  domain: AdaptabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAdaptabilityvaultizabilityAdminRecords(
  inventory: WorkspaceAdaptabilityvaultizabilityDomainInventory[],
): AdaptabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAdaptabilityvaultizabilityAdminStats(input: {
  records: AdaptabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AdaptabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const adaptabilityvaultizabilityPercent =
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
    adaptabilityvaultizabilityPercent,
  }
}

export function getAdaptabilityvaultizabilityAdminGuidance(input: {
  stats: AdaptabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect adaptabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial adaptabilityvaultizability coverage and refresh the adaptabilityvaultizability summary.'
  }

  if (input.stats.adaptabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership adaptabilityvaultizability below the 95% target and refresh the adaptabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace adaptabilityvaultizability coverage and refresh the adaptabilityvaultizability summary.'
}

export function resolveAdaptabilityvaultizabilityAdminActions(): AdaptabilityvaultizabilityAdminAction[] {
  return ['refresh_adaptabilityvaultizability_summary']
}
