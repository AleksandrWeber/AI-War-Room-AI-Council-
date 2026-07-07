import type {
  ProofjournalizabilityAdminAction,
  ProofjournalizabilityAdminRecord,
  ProofjournalizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceProofjournalizabilityDomainInventory = {
  domain: ProofjournalizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildProofjournalizabilityAdminRecords(
  inventory: WorkspaceProofjournalizabilityDomainInventory[],
): ProofjournalizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildProofjournalizabilityAdminStats(input: {
  records: ProofjournalizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ProofjournalizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const proofjournalizabilityPercent =
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
    proofjournalizabilityPercent,
  }
}

export function getProofjournalizabilityAdminGuidance(input: {
  stats: ProofjournalizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect proofjournalizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial proofjournalizability coverage and refresh the proofjournalizability summary.'
  }

  if (input.stats.proofjournalizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan proofjournalizability below the 95% target and refresh the proofjournalizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace proofjournalizability coverage and refresh the proofjournalizability summary.'
}

export function resolveProofjournalizabilityAdminActions(): ProofjournalizabilityAdminAction[] {
  return ['refresh_proofjournalizability_summary']
}
