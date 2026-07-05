import type {
  DocumentizabilityAdminAction,
  DocumentizabilityAdminRecord,
  DocumentizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceDocumentizabilityDomainInventory = {
  domain: DocumentizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildDocumentizabilityAdminRecords(
  inventory: WorkspaceDocumentizabilityDomainInventory[],
): DocumentizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildDocumentizabilityAdminStats(input: {
  records: DocumentizabilityAdminRecord[]
  postgresConnectivity: boolean
}): DocumentizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const documentizabilityPercent =
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
    documentizabilityPercent,
  }
}

export function getDocumentizabilityAdminGuidance(input: {
  stats: DocumentizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect documentizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial documentizability coverage and refresh the documentizability summary.'
  }

  if (input.stats.documentizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership documentizability below the 95% target and refresh the documentizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace documentizability coverage and refresh the documentizability summary.'
}

export function resolveDocumentizabilityAdminActions(): DocumentizabilityAdminAction[] {
  return ['refresh_documentizability_summary']
}
