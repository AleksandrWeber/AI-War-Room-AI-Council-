import type {
  RepresentabilityAdminAction,
  RepresentabilityAdminRecord,
  RepresentabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRepresentabilityDomainInventory = {
  domain: RepresentabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRepresentabilityAdminRecords(
  inventory: WorkspaceRepresentabilityDomainInventory[],
): RepresentabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRepresentabilityAdminStats(input: {
  records: RepresentabilityAdminRecord[]
  postgresConnectivity: boolean
}): RepresentabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const representabilityPercent =
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
    representabilityPercent,
  }
}

export function getRepresentabilityAdminGuidance(input: {
  stats: RepresentabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect representability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial representability coverage and refresh the representability summary.'
  }

  if (input.stats.representabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice representability below the 95% target and refresh the representability summary.'
  }

  return 'Workspace owners and admins can inspect workspace representability coverage and refresh the representability summary.'
}

export function resolveRepresentabilityAdminActions(): RepresentabilityAdminAction[] {
  return ['refresh_representability_summary']
}
