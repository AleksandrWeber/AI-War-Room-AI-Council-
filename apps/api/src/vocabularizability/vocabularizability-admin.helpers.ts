import type {
  VocabularizabilityAdminAction,
  VocabularizabilityAdminRecord,
  VocabularizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceVocabularizabilityDomainInventory = {
  domain: VocabularizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildVocabularizabilityAdminRecords(
  inventory: WorkspaceVocabularizabilityDomainInventory[],
): VocabularizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildVocabularizabilityAdminStats(input: {
  records: VocabularizabilityAdminRecord[]
  postgresConnectivity: boolean
}): VocabularizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const vocabularizabilityPercent =
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
    vocabularizabilityPercent,
  }
}

export function getVocabularizabilityAdminGuidance(input: {
  stats: VocabularizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect vocabularizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial vocabularizability coverage and refresh the vocabularizability summary.'
  }

  if (input.stats.vocabularizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice vocabularizability below the 95% target and refresh the vocabularizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace vocabularizability coverage and refresh the vocabularizability summary.'
}

export function resolveVocabularizabilityAdminActions(): VocabularizabilityAdminAction[] {
  return ['refresh_vocabularizability_summary']
}
