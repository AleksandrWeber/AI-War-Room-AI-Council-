import type {
  RegistrarproofizabilityAdminAction,
  RegistrarproofizabilityAdminRecord,
  RegistrarproofizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRegistrarproofizabilityDomainInventory = {
  domain: RegistrarproofizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRegistrarproofizabilityAdminRecords(
  inventory: WorkspaceRegistrarproofizabilityDomainInventory[],
): RegistrarproofizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRegistrarproofizabilityAdminStats(input: {
  records: RegistrarproofizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RegistrarproofizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const registrarproofizabilityPercent =
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
    registrarproofizabilityPercent,
  }
}

export function getRegistrarproofizabilityAdminGuidance(input: {
  stats: RegistrarproofizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect registrarproofizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial registrarproofizability coverage and refresh the registrarproofizability summary.'
  }

  if (input.stats.registrarproofizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan registrarproofizability below the 95% target and refresh the registrarproofizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace registrarproofizability coverage and refresh the registrarproofizability summary.'
}

export function resolveRegistrarproofizabilityAdminActions(): RegistrarproofizabilityAdminAction[] {
  return ['refresh_registrarproofizability_summary']
}
