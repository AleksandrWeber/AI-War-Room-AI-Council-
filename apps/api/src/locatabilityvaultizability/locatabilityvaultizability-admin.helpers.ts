import type {
  LocatabilityvaultizabilityAdminAction,
  LocatabilityvaultizabilityAdminRecord,
  LocatabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceLocatabilityvaultizabilityDomainInventory = {
  domain: LocatabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildLocatabilityvaultizabilityAdminRecords(
  inventory: WorkspaceLocatabilityvaultizabilityDomainInventory[],
): LocatabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildLocatabilityvaultizabilityAdminStats(input: {
  records: LocatabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): LocatabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const locatabilityvaultizabilityPercent =
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
    locatabilityvaultizabilityPercent,
  }
}

export function getLocatabilityvaultizabilityAdminGuidance(input: {
  stats: LocatabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect locatabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial locatabilityvaultizability coverage and refresh the locatabilityvaultizability summary.'
  }

  if (input.stats.locatabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership locatabilityvaultizability below the 95% target and refresh the locatabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace locatabilityvaultizability coverage and refresh the locatabilityvaultizability summary.'
}

export function resolveLocatabilityvaultizabilityAdminActions(): LocatabilityvaultizabilityAdminAction[] {
  return ['refresh_locatabilityvaultizability_summary']
}
