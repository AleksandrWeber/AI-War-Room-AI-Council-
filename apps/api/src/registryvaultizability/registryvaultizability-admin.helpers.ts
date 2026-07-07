import type {
  RegistryvaultizabilityAdminAction,
  RegistryvaultizabilityAdminRecord,
  RegistryvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRegistryvaultizabilityDomainInventory = {
  domain: RegistryvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRegistryvaultizabilityAdminRecords(
  inventory: WorkspaceRegistryvaultizabilityDomainInventory[],
): RegistryvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRegistryvaultizabilityAdminStats(input: {
  records: RegistryvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RegistryvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const registryvaultizabilityPercent =
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
    registryvaultizabilityPercent,
  }
}

export function getRegistryvaultizabilityAdminGuidance(input: {
  stats: RegistryvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect registryvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial registryvaultizability coverage and refresh the registryvaultizability summary.'
  }

  if (input.stats.registryvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice registryvaultizability below the 95% target and refresh the registryvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace registryvaultizability coverage and refresh the registryvaultizability summary.'
}

export function resolveRegistryvaultizabilityAdminActions(): RegistryvaultizabilityAdminAction[] {
  return ['refresh_registryvaultizability_summary']
}
