import type {
  LinkabilityvaultizabilityAdminAction,
  LinkabilityvaultizabilityAdminRecord,
  LinkabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceLinkabilityvaultizabilityDomainInventory = {
  domain: LinkabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildLinkabilityvaultizabilityAdminRecords(
  inventory: WorkspaceLinkabilityvaultizabilityDomainInventory[],
): LinkabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildLinkabilityvaultizabilityAdminStats(input: {
  records: LinkabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): LinkabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const linkabilityvaultizabilityPercent =
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
    linkabilityvaultizabilityPercent,
  }
}

export function getLinkabilityvaultizabilityAdminGuidance(input: {
  stats: LinkabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect linkabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial linkabilityvaultizability coverage and refresh the linkabilityvaultizability summary.'
  }

  if (input.stats.linkabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership linkabilityvaultizability below the 95% target and refresh the linkabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace linkabilityvaultizability coverage and refresh the linkabilityvaultizability summary.'
}

export function resolveLinkabilityvaultizabilityAdminActions(): LinkabilityvaultizabilityAdminAction[] {
  return ['refresh_linkabilityvaultizability_summary']
}
