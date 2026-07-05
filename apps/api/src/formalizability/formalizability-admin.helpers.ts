import type {
  FormalizabilityAdminAction,
  FormalizabilityAdminRecord,
  FormalizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceFormalizabilityDomainInventory = {
  domain: FormalizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildFormalizabilityAdminRecords(
  inventory: WorkspaceFormalizabilityDomainInventory[],
): FormalizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildFormalizabilityAdminStats(input: {
  records: FormalizabilityAdminRecord[]
  postgresConnectivity: boolean
}): FormalizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const formalizabilityPercent =
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
    formalizabilityPercent,
  }
}

export function getFormalizabilityAdminGuidance(input: {
  stats: FormalizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect formalizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial formalizability coverage and refresh the formalizability summary.'
  }

  if (input.stats.formalizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential formalizability below the 95% target and refresh the formalizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace formalizability coverage and refresh the formalizability summary.'
}

export function resolveFormalizabilityAdminActions(): FormalizabilityAdminAction[] {
  return ['refresh_formalizability_summary']
}
