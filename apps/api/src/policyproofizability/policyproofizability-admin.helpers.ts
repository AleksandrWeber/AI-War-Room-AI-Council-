import type {
  PolicyproofizabilityAdminAction,
  PolicyproofizabilityAdminRecord,
  PolicyproofizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspacePolicyproofizabilityDomainInventory = {
  domain: PolicyproofizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildPolicyproofizabilityAdminRecords(
  inventory: WorkspacePolicyproofizabilityDomainInventory[],
): PolicyproofizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildPolicyproofizabilityAdminStats(input: {
  records: PolicyproofizabilityAdminRecord[]
  postgresConnectivity: boolean
}): PolicyproofizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const policyproofizabilityPercent =
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
    policyproofizabilityPercent,
  }
}

export function getPolicyproofizabilityAdminGuidance(input: {
  stats: PolicyproofizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect policyproofizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial policyproofizability coverage and refresh the policyproofizability summary.'
  }

  if (input.stats.policyproofizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice policyproofizability below the 95% target and refresh the policyproofizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace policyproofizability coverage and refresh the policyproofizability summary.'
}

export function resolvePolicyproofizabilityAdminActions(): PolicyproofizabilityAdminAction[] {
  return ['refresh_policyproofizability_summary']
}
