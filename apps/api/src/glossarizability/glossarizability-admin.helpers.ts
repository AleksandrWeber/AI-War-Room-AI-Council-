import type {
  GlossarizabilityAdminAction,
  GlossarizabilityAdminRecord,
  GlossarizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceGlossarizabilityDomainInventory = {
  domain: GlossarizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildGlossarizabilityAdminRecords(
  inventory: WorkspaceGlossarizabilityDomainInventory[],
): GlossarizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildGlossarizabilityAdminStats(input: {
  records: GlossarizabilityAdminRecord[]
  postgresConnectivity: boolean
}): GlossarizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const glossarizabilityPercent =
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
    glossarizabilityPercent,
  }
}

export function getGlossarizabilityAdminGuidance(input: {
  stats: GlossarizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect glossarizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial glossarizability coverage and refresh the glossarizability summary.'
  }

  if (input.stats.glossarizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan glossarizability below the 95% target and refresh the glossarizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace glossarizability coverage and refresh the glossarizability summary.'
}

export function resolveGlossarizabilityAdminActions(): GlossarizabilityAdminAction[] {
  return ['refresh_glossarizability_summary']
}
