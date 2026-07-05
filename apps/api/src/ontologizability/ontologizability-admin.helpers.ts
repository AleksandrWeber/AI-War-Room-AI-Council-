import type {
  OntologizabilityAdminAction,
  OntologizabilityAdminRecord,
  OntologizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceOntologizabilityDomainInventory = {
  domain: OntologizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildOntologizabilityAdminRecords(
  inventory: WorkspaceOntologizabilityDomainInventory[],
): OntologizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildOntologizabilityAdminStats(input: {
  records: OntologizabilityAdminRecord[]
  postgresConnectivity: boolean
}): OntologizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const ontologizabilityPercent =
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
    ontologizabilityPercent,
  }
}

export function getOntologizabilityAdminGuidance(input: {
  stats: OntologizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect ontologizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial ontologizability coverage and refresh the ontologizability summary.'
  }

  if (input.stats.ontologizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership ontologizability below the 95% target and refresh the ontologizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace ontologizability coverage and refresh the ontologizability summary.'
}

export function resolveOntologizabilityAdminActions(): OntologizabilityAdminAction[] {
  return ['refresh_ontologizability_summary']
}
