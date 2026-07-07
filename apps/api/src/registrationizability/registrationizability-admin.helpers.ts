import type {
  RegistrationizabilityAdminAction,
  RegistrationizabilityAdminRecord,
  RegistrationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRegistrationizabilityDomainInventory = {
  domain: RegistrationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRegistrationizabilityAdminRecords(
  inventory: WorkspaceRegistrationizabilityDomainInventory[],
): RegistrationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRegistrationizabilityAdminStats(input: {
  records: RegistrationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RegistrationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const registrationizabilityPercent =
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
    registrationizabilityPercent,
  }
}

export function getRegistrationizabilityAdminGuidance(input: {
  stats: RegistrationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect registrationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial registrationizability coverage and refresh the registrationizability summary.'
  }

  if (input.stats.registrationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage registrationizability below the 95% target and refresh the registrationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace registrationizability coverage and refresh the registrationizability summary.'
}

export function resolveRegistrationizabilityAdminActions(): RegistrationizabilityAdminAction[] {
  return ['refresh_registrationizability_summary']
}
