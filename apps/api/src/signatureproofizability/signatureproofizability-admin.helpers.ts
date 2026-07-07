import type {
  SignatureproofizabilityAdminAction,
  SignatureproofizabilityAdminRecord,
  SignatureproofizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSignatureproofizabilityDomainInventory = {
  domain: SignatureproofizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSignatureproofizabilityAdminRecords(
  inventory: WorkspaceSignatureproofizabilityDomainInventory[],
): SignatureproofizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSignatureproofizabilityAdminStats(input: {
  records: SignatureproofizabilityAdminRecord[]
  postgresConnectivity: boolean
}): SignatureproofizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_notifications')
      ?.recordCount ?? 0
  const signatureproofizabilityPercent =
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
    signatureproofizabilityPercent,
  }
}

export function getSignatureproofizabilityAdminGuidance(input: {
  stats: SignatureproofizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect signatureproofizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial signatureproofizability coverage and refresh the signatureproofizability summary.'
  }

  if (input.stats.signatureproofizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing notification signatureproofizability below the 95% target and refresh the signatureproofizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace signatureproofizability coverage and refresh the signatureproofizability summary.'
}

export function resolveSignatureproofizabilityAdminActions(): SignatureproofizabilityAdminAction[] {
  return ['refresh_signatureproofizability_summary']
}
