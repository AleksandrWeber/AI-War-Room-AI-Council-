import type {
  EvidencejournalizabilityAdminAction,
  EvidencejournalizabilityAdminRecord,
  EvidencejournalizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceEvidencejournalizabilityDomainInventory = {
  domain: EvidencejournalizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildEvidencejournalizabilityAdminRecords(
  inventory: WorkspaceEvidencejournalizabilityDomainInventory[],
): EvidencejournalizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildEvidencejournalizabilityAdminStats(input: {
  records: EvidencejournalizabilityAdminRecord[]
  postgresConnectivity: boolean
}): EvidencejournalizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const evidencejournalizabilityPercent =
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
    evidencejournalizabilityPercent,
  }
}

export function getEvidencejournalizabilityAdminGuidance(input: {
  stats: EvidencejournalizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect evidencejournalizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial evidencejournalizability coverage and refresh the evidencejournalizability summary.'
  }

  if (input.stats.evidencejournalizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key evidencejournalizability below the 95% target and refresh the evidencejournalizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace evidencejournalizability coverage and refresh the evidencejournalizability summary.'
}

export function resolveEvidencejournalizabilityAdminActions(): EvidencejournalizabilityAdminAction[] {
  return ['refresh_evidencejournalizability_summary']
}
