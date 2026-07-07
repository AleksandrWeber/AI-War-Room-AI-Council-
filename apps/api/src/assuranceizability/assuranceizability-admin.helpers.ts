import type {
  AssuranceizabilityAdminAction,
  AssuranceizabilityAdminRecord,
  AssuranceizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAssuranceizabilityDomainInventory = {
  domain: AssuranceizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAssuranceizabilityAdminRecords(
  inventory: WorkspaceAssuranceizabilityDomainInventory[],
): AssuranceizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAssuranceizabilityAdminStats(input: {
  records: AssuranceizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AssuranceizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const assuranceizabilityPercent =
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
    assuranceizabilityPercent,
  }
}

export function getAssuranceizabilityAdminGuidance(input: {
  stats: AssuranceizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect assuranceizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial assuranceizability coverage and refresh the assuranceizability summary.'
  }

  if (input.stats.assuranceizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan assuranceizability below the 95% target and refresh the assuranceizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace assuranceizability coverage and refresh the assuranceizability summary.'
}

export function resolveAssuranceizabilityAdminActions(): AssuranceizabilityAdminAction[] {
  return ['refresh_assuranceizability_summary']
}
