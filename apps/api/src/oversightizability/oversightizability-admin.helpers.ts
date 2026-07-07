import type {
  OversightizabilityAdminAction,
  OversightizabilityAdminRecord,
  OversightizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceOversightizabilityDomainInventory = {
  domain: OversightizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildOversightizabilityAdminRecords(
  inventory: WorkspaceOversightizabilityDomainInventory[],
): OversightizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildOversightizabilityAdminStats(input: {
  records: OversightizabilityAdminRecord[]
  postgresConnectivity: boolean
}): OversightizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const oversightizabilityPercent =
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
    oversightizabilityPercent,
  }
}

export function getOversightizabilityAdminGuidance(input: {
  stats: OversightizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect oversightizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial oversightizability coverage and refresh the oversightizability summary.'
  }

  if (input.stats.oversightizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan oversightizability below the 95% target and refresh the oversightizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace oversightizability coverage and refresh the oversightizability summary.'
}

export function resolveOversightizabilityAdminActions(): OversightizabilityAdminAction[] {
  return ['refresh_oversightizability_summary']
}
