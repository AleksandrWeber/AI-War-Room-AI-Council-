import type {
  CheckpointizabilityAdminAction,
  CheckpointizabilityAdminRecord,
  CheckpointizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceCheckpointizabilityDomainInventory = {
  domain: CheckpointizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildCheckpointizabilityAdminRecords(
  inventory: WorkspaceCheckpointizabilityDomainInventory[],
): CheckpointizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildCheckpointizabilityAdminStats(input: {
  records: CheckpointizabilityAdminRecord[]
  postgresConnectivity: boolean
}): CheckpointizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_invoices')
      ?.recordCount ?? 0
  const checkpointizabilityPercent =
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
    checkpointizabilityPercent,
  }
}

export function getCheckpointizabilityAdminGuidance(input: {
  stats: CheckpointizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect checkpointizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial checkpointizability coverage and refresh the checkpointizability summary.'
  }

  if (input.stats.checkpointizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect billing invoice checkpointizability below the 95% target and refresh the checkpointizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace checkpointizability coverage and refresh the checkpointizability summary.'
}

export function resolveCheckpointizabilityAdminActions(): CheckpointizabilityAdminAction[] {
  return ['refresh_checkpointizability_summary']
}
