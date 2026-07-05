import type {
  VerifiabilityAdminAction,
  VerifiabilityAdminRecord,
  VerifiabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceVerifiabilityDomainInventory = {
  domain: VerifiabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildVerifiabilityAdminRecords(
  inventory: WorkspaceVerifiabilityDomainInventory[],
): VerifiabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildVerifiabilityAdminStats(input: {
  records: VerifiabilityAdminRecord[]
  postgresConnectivity: boolean
}): VerifiabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const verifiabilityPercent =
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
    verifiabilityPercent,
  }
}

export function getVerifiabilityAdminGuidance(input: {
  stats: VerifiabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect verifiability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial verifiability coverage and refresh the verifiability summary.'
  }

  if (input.stats.verifiabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice verifiability below the 95% target and refresh the verifiability summary.'
  }

  return 'Workspace owners and admins can inspect workspace verifiability coverage and refresh the verifiability summary.'
}

export function resolveVerifiabilityAdminActions(): VerifiabilityAdminAction[] {
  return ['refresh_verifiability_summary']
}
