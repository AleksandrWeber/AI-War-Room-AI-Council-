import type {
  PatchizabilityAdminAction,
  PatchizabilityAdminRecord,
  PatchizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePatchizabilityDomainInventory = {
  domain: PatchizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPatchizabilityAdminRecords(
  inventory: WorkspacePatchizabilityDomainInventory[],
): PatchizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPatchizabilityAdminStats(input: {
  records: PatchizabilityAdminRecord[]
  postgresConnectivity: boolean
}): PatchizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'model_health_events')
      ?.recordCount ?? 0
  const patchizabilityPercent =
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
    patchizabilityPercent,
  }
}

export function getPatchizabilityAdminGuidance(input: {
  stats: PatchizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect patchizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial patchizability coverage and refresh the patchizability summary.'
  }

  if (input.stats.patchizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect model health patchizability below the 95% target and refresh the patchizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace patchizability coverage and refresh the patchizability summary.'
}

export function resolvePatchizabilityAdminActions(): PatchizabilityAdminAction[] {
  return ['refresh_patchizability_summary']
}
