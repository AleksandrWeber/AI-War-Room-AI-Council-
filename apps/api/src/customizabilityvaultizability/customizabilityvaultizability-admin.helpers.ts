import type {
  CustomizabilityvaultizabilityAdminAction,
  CustomizabilityvaultizabilityAdminRecord,
  CustomizabilityvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCustomizabilityvaultizabilityDomainInventory = {
  domain: CustomizabilityvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCustomizabilityvaultizabilityAdminRecords(
  inventory: WorkspaceCustomizabilityvaultizabilityDomainInventory[],
): CustomizabilityvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCustomizabilityvaultizabilityAdminStats(input: {
  records: CustomizabilityvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CustomizabilityvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const customizabilityvaultizabilityPercent =
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
    customizabilityvaultizabilityPercent,
  }
}

export function getCustomizabilityvaultizabilityAdminGuidance(input: {
  stats: CustomizabilityvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect customizabilityvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial customizabilityvaultizability coverage and refresh the customizabilityvaultizability summary.'
  }

  if (input.stats.customizabilityvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership customizabilityvaultizability below the 95% target and refresh the customizabilityvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace customizabilityvaultizability coverage and refresh the customizabilityvaultizability summary.'
}

export function resolveCustomizabilityvaultizabilityAdminActions(): CustomizabilityvaultizabilityAdminAction[] {
  return ['refresh_customizabilityvaultizability_summary']
}
