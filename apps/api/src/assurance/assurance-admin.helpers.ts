import type {
  AssuranceAdminAction,
  AssuranceAdminRecord,
  AssuranceAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAssuranceDomainInventory = {
  domain: AssuranceAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAssuranceAdminRecords(
  inventory: WorkspaceAssuranceDomainInventory[],
): AssuranceAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAssuranceAdminStats(input: {
  records: AssuranceAdminRecord[]
  postgresConnectivity: boolean
}): AssuranceAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const shieldReviews =
    input.records.find((record) => record.domain === 'shield_reviews')
      ?.recordCount ?? 0
  const assurancePercent =
    completedRuns === 0
      ? 100
      : Math.min(100, Math.round((shieldReviews / completedRuns) * 100))

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    assurancePercent,
  }
}

export function getAssuranceAdminGuidance(input: {
  stats: AssuranceAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect assurance metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial assurance coverage and refresh the assurance summary.'
  }

  if (input.stats.assurancePercent < 95) {
    return 'Workspace owners and admins can inspect shield quality assurance below the 95% target and refresh the assurance summary.'
  }

  return 'Workspace owners and admins can inspect workspace assurance coverage and refresh the assurance summary.'
}

export function resolveAssuranceAdminActions(): AssuranceAdminAction[] {
  return ['refresh_assurance_summary']
}
