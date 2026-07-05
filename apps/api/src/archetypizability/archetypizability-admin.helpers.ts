import type {
  ArchetypizabilityAdminAction,
  ArchetypizabilityAdminRecord,
  ArchetypizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceArchetypizabilityDomainInventory = {
  domain: ArchetypizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildArchetypizabilityAdminRecords(
  inventory: WorkspaceArchetypizabilityDomainInventory[],
): ArchetypizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildArchetypizabilityAdminStats(input: {
  records: ArchetypizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ArchetypizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_records')
      ?.recordCount ?? 0
  const archetypizabilityPercent =
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
    archetypizabilityPercent,
  }
}

export function getArchetypizabilityAdminGuidance(input: {
  stats: ArchetypizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect archetypizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial archetypizability coverage and refresh the archetypizability summary.'
  }

  if (input.stats.archetypizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing record archetypizability below the 95% target and refresh the archetypizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace archetypizability coverage and refresh the archetypizability summary.'
}

export function resolveArchetypizabilityAdminActions(): ArchetypizabilityAdminAction[] {
  return ['refresh_archetypizability_summary']
}
