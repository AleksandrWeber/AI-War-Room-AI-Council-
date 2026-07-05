import type {
  AnnotationizabilityAdminAction,
  AnnotationizabilityAdminRecord,
  AnnotationizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceAnnotationizabilityDomainInventory = {
  domain: AnnotationizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildAnnotationizabilityAdminRecords(
  inventory: WorkspaceAnnotationizabilityDomainInventory[],
): AnnotationizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildAnnotationizabilityAdminStats(input: {
  records: AnnotationizabilityAdminRecord[]
  postgresConnectivity: boolean
}): AnnotationizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const annotationizabilityPercent =
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
    annotationizabilityPercent,
  }
}

export function getAnnotationizabilityAdminGuidance(input: {
  stats: AnnotationizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect annotationizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial annotationizability coverage and refresh the annotationizability summary.'
  }

  if (input.stats.annotationizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice annotationizability below the 95% target and refresh the annotationizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace annotationizability coverage and refresh the annotationizability summary.'
}

export function resolveAnnotationizabilityAdminActions(): AnnotationizabilityAdminAction[] {
  return ['refresh_annotationizability_summary']
}
