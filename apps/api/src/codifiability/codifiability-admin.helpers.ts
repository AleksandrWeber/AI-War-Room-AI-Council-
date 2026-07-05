import type {
  CodifiabilityAdminAction,
  CodifiabilityAdminRecord,
  CodifiabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCodifiabilityDomainInventory = {
  domain: CodifiabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCodifiabilityAdminRecords(
  inventory: WorkspaceCodifiabilityDomainInventory[],
): CodifiabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCodifiabilityAdminStats(input: {
  records: CodifiabilityAdminRecord[]
  postgresConnectivity: boolean
}): CodifiabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const codifiabilityPercent =
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
    codifiabilityPercent,
  }
}

export function getCodifiabilityAdminGuidance(input: {
  stats: CodifiabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect codifiability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial codifiability coverage and refresh the codifiability summary.'
  }

  if (input.stats.codifiabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential codifiability below the 95% target and refresh the codifiability summary.'
  }

  return 'Workspace owners and admins can inspect workspace codifiability coverage and refresh the codifiability summary.'
}

export function resolveCodifiabilityAdminActions(): CodifiabilityAdminAction[] {
  return ['refresh_codifiability_summary']
}
