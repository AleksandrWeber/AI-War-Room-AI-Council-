import type {
  RuleproofizabilityAdminAction,
  RuleproofizabilityAdminRecord,
  RuleproofizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRuleproofizabilityDomainInventory = {
  domain: RuleproofizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRuleproofizabilityAdminRecords(
  inventory: WorkspaceRuleproofizabilityDomainInventory[],
): RuleproofizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRuleproofizabilityAdminStats(input: {
  records: RuleproofizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RuleproofizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const ruleproofizabilityPercent =
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
    ruleproofizabilityPercent,
  }
}

export function getRuleproofizabilityAdminGuidance(input: {
  stats: RuleproofizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect ruleproofizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial ruleproofizability coverage and refresh the ruleproofizability summary.'
  }

  if (input.stats.ruleproofizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice ruleproofizability below the 95% target and refresh the ruleproofizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace ruleproofizability coverage and refresh the ruleproofizability summary.'
}

export function resolveRuleproofizabilityAdminActions(): RuleproofizabilityAdminAction[] {
  return ['refresh_ruleproofizability_summary']
}
