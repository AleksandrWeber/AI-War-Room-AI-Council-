import type {
  HardeningizabilityAdminAction,
  HardeningizabilityAdminRecord,
  HardeningizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceHardeningizabilityDomainInventory = {
  domain: HardeningizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildHardeningizabilityAdminRecords(
  inventory: WorkspaceHardeningizabilityDomainInventory[],
): HardeningizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildHardeningizabilityAdminStats(input: {
  records: HardeningizabilityAdminRecord[]
  postgresConnectivity: boolean
}): HardeningizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const hardeningizabilityPercent =
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
    hardeningizabilityPercent,
  }
}

export function getHardeningizabilityAdminGuidance(input: {
  stats: HardeningizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect hardeningizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial hardeningizability coverage and refresh the hardeningizability summary.'
  }

  if (input.stats.hardeningizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan hardeningizability below the 95% target and refresh the hardeningizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace hardeningizability coverage and refresh the hardeningizability summary.'
}

export function resolveHardeningizabilityAdminActions(): HardeningizabilityAdminAction[] {
  return ['refresh_hardeningizability_summary']
}
