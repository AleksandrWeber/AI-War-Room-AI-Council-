import type {
  AuditvaultizabilityAdminAction,
  AuditvaultizabilityAdminRecord,
  AuditvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAuditvaultizabilityDomainInventory = {
  domain: AuditvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAuditvaultizabilityAdminRecords(
  inventory: WorkspaceAuditvaultizabilityDomainInventory[],
): AuditvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAuditvaultizabilityAdminStats(input: {
  records: AuditvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AuditvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const auditvaultizabilityPercent =
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
    auditvaultizabilityPercent,
  }
}

export function getAuditvaultizabilityAdminGuidance(input: {
  stats: AuditvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect auditvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial auditvaultizability coverage and refresh the auditvaultizability summary.'
  }

  if (input.stats.auditvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan auditvaultizability below the 95% target and refresh the auditvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace auditvaultizability coverage and refresh the auditvaultizability summary.'
}

export function resolveAuditvaultizabilityAdminActions(): AuditvaultizabilityAdminAction[] {
  return ['refresh_auditvaultizability_summary']
}
