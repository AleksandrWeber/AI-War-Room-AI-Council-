import type {
  AssurancevaultizabilityAdminAction,
  AssurancevaultizabilityAdminRecord,
  AssurancevaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAssurancevaultizabilityDomainInventory = {
  domain: AssurancevaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAssurancevaultizabilityAdminRecords(
  inventory: WorkspaceAssurancevaultizabilityDomainInventory[],
): AssurancevaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAssurancevaultizabilityAdminStats(input: {
  records: AssurancevaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AssurancevaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const assurancevaultizabilityPercent =
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
    assurancevaultizabilityPercent,
  }
}

export function getAssurancevaultizabilityAdminGuidance(input: {
  stats: AssurancevaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect assurancevaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial assurancevaultizability coverage and refresh the assurancevaultizability summary.'
  }

  if (input.stats.assurancevaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice assurancevaultizability below the 95% target and refresh the assurancevaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace assurancevaultizability coverage and refresh the assurancevaultizability summary.'
}

export function resolveAssurancevaultizabilityAdminActions(): AssurancevaultizabilityAdminAction[] {
  return ['refresh_assurancevaultizability_summary']
}
