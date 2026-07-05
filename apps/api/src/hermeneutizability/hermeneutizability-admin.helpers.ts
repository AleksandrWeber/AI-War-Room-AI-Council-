import type {
  HermeneutizabilityAdminAction,
  HermeneutizabilityAdminRecord,
  HermeneutizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceHermeneutizabilityDomainInventory = {
  domain: HermeneutizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildHermeneutizabilityAdminRecords(
  inventory: WorkspaceHermeneutizabilityDomainInventory[],
): HermeneutizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildHermeneutizabilityAdminStats(input: {
  records: HermeneutizabilityAdminRecord[]
  postgresConnectivity: boolean
}): HermeneutizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'idempotency_keys')
      ?.recordCount ?? 0
  const hermeneutizabilityPercent =
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
    hermeneutizabilityPercent,
  }
}

export function getHermeneutizabilityAdminGuidance(input: {
  stats: HermeneutizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect hermeneutizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial hermeneutizability coverage and refresh the hermeneutizability summary.'
  }

  if (input.stats.hermeneutizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect idempotency key hermeneutizability below the 95% target and refresh the hermeneutizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace hermeneutizability coverage and refresh the hermeneutizability summary.'
}

export function resolveHermeneutizabilityAdminActions(): HermeneutizabilityAdminAction[] {
  return ['refresh_hermeneutizability_summary']
}
