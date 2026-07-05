import type {
  SyntacticizabilityAdminAction,
  SyntacticizabilityAdminRecord,
  SyntacticizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSyntacticizabilityDomainInventory = {
  domain: SyntacticizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSyntacticizabilityAdminRecords(
  inventory: WorkspaceSyntacticizabilityDomainInventory[],
): SyntacticizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSyntacticizabilityAdminStats(input: {
  records: SyntacticizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SyntacticizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_webhook_events')
      ?.recordCount ?? 0
  const syntacticizabilityPercent =
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
    syntacticizabilityPercent,
  }
}

export function getSyntacticizabilityAdminGuidance(input: {
  stats: SyntacticizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect syntacticizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial syntacticizability coverage and refresh the syntacticizability summary.'
  }

  if (input.stats.syntacticizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing webhook syntacticizability below the 95% target and refresh the syntacticizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace syntacticizability coverage and refresh the syntacticizability summary.'
}

export function resolveSyntacticizabilityAdminActions(): SyntacticizabilityAdminAction[] {
  return ['refresh_syntacticizability_summary']
}
