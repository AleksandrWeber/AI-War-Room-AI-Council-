import type {
  ImportizabilityAdminAction,
  ImportizabilityAdminRecord,
  ImportizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceImportizabilityDomainInventory = {
  domain: ImportizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildImportizabilityAdminRecords(
  inventory: WorkspaceImportizabilityDomainInventory[],
): ImportizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildImportizabilityAdminStats(input: {
  records: ImportizabilityAdminRecord[]
  postgresConnectivity: boolean
}): ImportizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const importizabilityPercent =
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
    importizabilityPercent,
  }
}

export function getImportizabilityAdminGuidance(input: {
  stats: ImportizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect importizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial importizability coverage and refresh the importizability summary.'
  }

  if (input.stats.importizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential importizability below the 95% target and refresh the importizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace importizability coverage and refresh the importizability summary.'
}

export function resolveImportizabilityAdminActions(): ImportizabilityAdminAction[] {
  return ['refresh_importizability_summary']
}
