import type {
  SpecificationizabilityAdminAction,
  SpecificationizabilityAdminRecord,
  SpecificationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSpecificationizabilityDomainInventory = {
  domain: SpecificationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSpecificationizabilityAdminRecords(
  inventory: WorkspaceSpecificationizabilityDomainInventory[],
): SpecificationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSpecificationizabilityAdminStats(input: {
  records: SpecificationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SpecificationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const specificationizabilityPercent =
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
    specificationizabilityPercent,
  }
}

export function getSpecificationizabilityAdminGuidance(input: {
  stats: SpecificationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect specificationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial specificationizability coverage and refresh the specificationizability summary.'
  }

  if (input.stats.specificationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key specificationizability below the 95% target and refresh the specificationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace specificationizability coverage and refresh the specificationizability summary.'
}

export function resolveSpecificationizabilityAdminActions(): SpecificationizabilityAdminAction[] {
  return ['refresh_specificationizability_summary']
}
