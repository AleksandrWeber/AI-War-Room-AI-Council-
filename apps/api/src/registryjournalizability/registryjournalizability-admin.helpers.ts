import type {
  RegistryjournalizabilityAdminAction,
  RegistryjournalizabilityAdminRecord,
  RegistryjournalizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRegistryjournalizabilityDomainInventory = {
  domain: RegistryjournalizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRegistryjournalizabilityAdminRecords(
  inventory: WorkspaceRegistryjournalizabilityDomainInventory[],
): RegistryjournalizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRegistryjournalizabilityAdminStats(input: {
  records: RegistryjournalizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RegistryjournalizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const registryjournalizabilityPercent =
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
    registryjournalizabilityPercent,
  }
}

export function getRegistryjournalizabilityAdminGuidance(input: {
  stats: RegistryjournalizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect registryjournalizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial registryjournalizability coverage and refresh the registryjournalizability summary.'
  }

  if (input.stats.registryjournalizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice registryjournalizability below the 95% target and refresh the registryjournalizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace registryjournalizability coverage and refresh the registryjournalizability summary.'
}

export function resolveRegistryjournalizabilityAdminActions(): RegistryjournalizabilityAdminAction[] {
  return ['refresh_registryjournalizability_summary']
}
