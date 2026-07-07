import type {
  PolicyizabilityAdminAction,
  PolicyizabilityAdminRecord,
  PolicyizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePolicyizabilityDomainInventory = {
  domain: PolicyizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPolicyizabilityAdminRecords(
  inventory: WorkspacePolicyizabilityDomainInventory[],
): PolicyizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPolicyizabilityAdminStats(input: {
  records: PolicyizabilityAdminRecord[]
  postgresConnectivity: boolean
}): PolicyizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_memberships')
      ?.recordCount ?? 0
  const policyizabilityPercent =
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
    policyizabilityPercent,
  }
}

export function getPolicyizabilityAdminGuidance(input: {
  stats: PolicyizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect policyizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial policyizability coverage and refresh the policyizability summary.'
  }

  if (input.stats.policyizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect membership policyizability below the 95% target and refresh the policyizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace policyizability coverage and refresh the policyizability summary.'
}

export function resolvePolicyizabilityAdminActions(): PolicyizabilityAdminAction[] {
  return ['refresh_policyizability_summary']
}
