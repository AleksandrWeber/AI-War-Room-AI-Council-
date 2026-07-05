import type {
  SubstantiabilityAdminAction,
  SubstantiabilityAdminRecord,
  SubstantiabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSubstantiabilityDomainInventory = {
  domain: SubstantiabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSubstantiabilityAdminRecords(
  inventory: WorkspaceSubstantiabilityDomainInventory[],
): SubstantiabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSubstantiabilityAdminStats(input: {
  records: SubstantiabilityAdminRecord[]
  postgresConnectivity: boolean
}): SubstantiabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_records')
      ?.recordCount ?? 0
  const substantiabilityPercent =
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
    substantiabilityPercent,
  }
}

export function getSubstantiabilityAdminGuidance(input: {
  stats: SubstantiabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect substantiability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial substantiability coverage and refresh the substantiability summary.'
  }

  if (input.stats.substantiabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing record substantiability below the 95% target and refresh the substantiability summary.'
  }

  return 'Workspace owners and admins can inspect workspace substantiability coverage and refresh the substantiability summary.'
}

export function resolveSubstantiabilityAdminActions(): SubstantiabilityAdminAction[] {
  return ['refresh_substantiability_summary']
}
