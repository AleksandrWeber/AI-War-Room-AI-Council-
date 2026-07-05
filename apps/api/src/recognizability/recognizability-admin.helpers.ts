import type {
  RecognizabilityAdminAction,
  RecognizabilityAdminRecord,
  RecognizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceRecognizabilityDomainInventory = {
  domain: RecognizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildRecognizabilityAdminRecords(
  inventory: WorkspaceRecognizabilityDomainInventory[],
): RecognizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildRecognizabilityAdminStats(input: {
  records: RecognizabilityAdminRecord[]
  postgresConnectivity: boolean
}): RecognizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'artifacts')
      ?.recordCount ?? 0
  const recognizabilityPercent =
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
    recognizabilityPercent,
  }
}

export function getRecognizabilityAdminGuidance(input: {
  stats: RecognizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect recognizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial recognizability coverage and refresh the recognizability summary.'
  }

  if (input.stats.recognizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect artifact recognizability below the 95% target and refresh the recognizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace recognizability coverage and refresh the recognizability summary.'
}

export function resolveRecognizabilityAdminActions(): RecognizabilityAdminAction[] {
  return ['refresh_recognizability_summary']
}
