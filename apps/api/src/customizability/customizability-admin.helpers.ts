import type {
  CustomizabilityAdminAction,
  CustomizabilityAdminRecord,
  CustomizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCustomizabilityDomainInventory = {
  domain: CustomizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCustomizabilityAdminRecords(
  inventory: WorkspaceCustomizabilityDomainInventory[],
): CustomizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCustomizabilityAdminStats(input: {
  records: CustomizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CustomizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'run_workflows')
      ?.recordCount ?? 0
  const customizabilityPercent =
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
    customizabilityPercent,
  }
}

export function getCustomizabilityAdminGuidance(input: {
  stats: CustomizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect customizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial customizability coverage and refresh the customizability summary.'
  }

  if (input.stats.customizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect workflow customizability below the 95% target and refresh the customizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace customizability coverage and refresh the customizability summary.'
}

export function resolveCustomizabilityAdminActions(): CustomizabilityAdminAction[] {
  return ['refresh_customizability_summary']
}
