import type {
  VerificationvaultizabilityAdminAction,
  VerificationvaultizabilityAdminRecord,
  VerificationvaultizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceVerificationvaultizabilityDomainInventory = {
  domain: VerificationvaultizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildVerificationvaultizabilityAdminRecords(
  inventory: WorkspaceVerificationvaultizabilityDomainInventory[],
): VerificationvaultizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildVerificationvaultizabilityAdminStats(input: {
  records: VerificationvaultizabilityAdminRecord[]
  postgresConnectivity: boolean
}): VerificationvaultizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const verificationvaultizabilityPercent =
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
    verificationvaultizabilityPercent,
  }
}

export function getVerificationvaultizabilityAdminGuidance(input: {
  stats: VerificationvaultizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect verificationvaultizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial verificationvaultizability coverage and refresh the verificationvaultizability summary.'
  }

  if (input.stats.verificationvaultizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan verificationvaultizability below the 95% target and refresh the verificationvaultizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace verificationvaultizability coverage and refresh the verificationvaultizability summary.'
}

export function resolveVerificationvaultizabilityAdminActions(): VerificationvaultizabilityAdminAction[] {
  return ['refresh_verificationvaultizability_summary']
}
