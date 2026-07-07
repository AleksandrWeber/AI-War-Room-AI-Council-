import type {
  RegistrarizabilityAdminAction,
  RegistrarizabilityAdminRecord,
  RegistrarizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRegistrarizabilityDomainInventory = {
  domain: RegistrarizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRegistrarizabilityAdminRecords(
  inventory: WorkspaceRegistrarizabilityDomainInventory[],
): RegistrarizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRegistrarizabilityAdminStats(input: {
  records: RegistrarizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RegistrarizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const registrarizabilityPercent =
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
    registrarizabilityPercent,
  }
}

export function getRegistrarizabilityAdminGuidance(input: {
  stats: RegistrarizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect registrarizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial registrarizability coverage and refresh the registrarizability summary.'
  }

  if (input.stats.registrarizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan registrarizability below the 95% target and refresh the registrarizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace registrarizability coverage and refresh the registrarizability summary.'
}

export function resolveRegistrarizabilityAdminActions(): RegistrarizabilityAdminAction[] {
  return ['refresh_registrarizability_summary']
}
