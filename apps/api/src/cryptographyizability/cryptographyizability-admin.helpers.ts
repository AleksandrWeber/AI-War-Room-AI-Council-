import type {
  CryptographyizabilityAdminAction,
  CryptographyizabilityAdminRecord,
  CryptographyizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCryptographyizabilityDomainInventory = {
  domain: CryptographyizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCryptographyizabilityAdminRecords(
  inventory: WorkspaceCryptographyizabilityDomainInventory[],
): CryptographyizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCryptographyizabilityAdminStats(input: {
  records: CryptographyizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CryptographyizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'shield_scans')
      ?.recordCount ?? 0
  const cryptographyizabilityPercent =
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
    cryptographyizabilityPercent,
  }
}

export function getCryptographyizabilityAdminGuidance(input: {
  stats: CryptographyizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect cryptographyizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial cryptographyizability coverage and refresh the cryptographyizability summary.'
  }

  if (input.stats.cryptographyizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect shield scan cryptographyizability below the 95% target and refresh the cryptographyizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace cryptographyizability coverage and refresh the cryptographyizability summary.'
}

export function resolveCryptographyizabilityAdminActions(): CryptographyizabilityAdminAction[] {
  return ['refresh_cryptographyizability_summary']
}
