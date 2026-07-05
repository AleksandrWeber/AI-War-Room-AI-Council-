import type {
  SerializabilityAdminAction,
  SerializabilityAdminRecord,
  SerializabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceSerializabilityDomainInventory = {
  domain: SerializabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildSerializabilityAdminRecords(
  inventory: WorkspaceSerializabilityDomainInventory[],
): SerializabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildSerializabilityAdminStats(input: {
  records: SerializabilityAdminRecord[]
  postgresConnectivity: boolean
}): SerializabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'workspace_provider_credentials')
      ?.recordCount ?? 0
  const serializabilityPercent =
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
    serializabilityPercent,
  }
}

export function getSerializabilityAdminGuidance(input: {
  stats: SerializabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect serializability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial serializability coverage and refresh the serializability summary.'
  }

  if (input.stats.serializabilityPercent < 95) {
    return 'Workspace owners and admins can inspect provider credential serializability below the 95% target and refresh the serializability summary.'
  }

  return 'Workspace owners and admins can inspect workspace serializability coverage and refresh the serializability summary.'
}

export function resolveSerializabilityAdminActions(): SerializabilityAdminAction[] {
  return ['refresh_serializability_summary']
}
