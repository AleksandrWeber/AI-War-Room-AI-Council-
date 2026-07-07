import type {
  ValidityvaultizabilityAdminAction,
  ValidityvaultizabilityAdminRecord,
  ValidityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceValidityvaultizabilityDomainInventory = {
  domain: ValidityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildValidityvaultizabilityAdminRecords(
  inventory: WorkspaceValidityvaultizabilityDomainInventory[],
): ValidityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildValidityvaultizabilityAdminStats(input: {
  records: ValidityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ValidityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const validityvaultizabilityPercent =
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
    validityvaultizabilityPercent,
  }
}

export function getValidityvaultizabilityAdminGuidance(input: {
  stats: ValidityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect validityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial validityvaultizability coverage and refresh the validityvaultizability summary.'
  }

  if (input.stats.validityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice validityvaultizability below the 95% target and refresh the validityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace validityvaultizability coverage and refresh the validityvaultizability summary.'
}

export function resolveValidityvaultizabilityAdminActions(): ValidityvaultizabilityAdminAction[] {
  return ['refresh_validityvaultizability_summary']
}
