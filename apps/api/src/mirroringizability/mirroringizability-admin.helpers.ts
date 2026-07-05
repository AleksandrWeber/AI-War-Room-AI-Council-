import type {
  MirroringizabilityAdminAction,
  MirroringizabilityAdminRecord,
  MirroringizabilityAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceMirroringizabilityDomainInventory = {
  domain: MirroringizabilityAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildMirroringizabilityAdminRecords(
  inventory: WorkspaceMirroringizabilityDomainInventory[],
): MirroringizabilityAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildMirroringizabilityAdminStats(input: {
  records: MirroringizabilityAdminRecord[]
  postgresConnectivity: boolean
}): MirroringizabilityAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length
  const completedRuns =
    input.records.find((record) => record.domain === 'completed_runs')
      ?.recordCount ?? 0
  const metricRecords =
    input.records.find((record) => record.domain === 'billing_meter_usage_reports')
      ?.recordCount ?? 0
  const mirroringizabilityPercent =
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
    mirroringizabilityPercent,
  }
}

export function getMirroringizabilityAdminGuidance(input: {
  stats: MirroringizabilityAdminStats
}) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect mirroringizability metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial mirroringizability coverage and refresh the mirroringizability summary.'
  }

  if (input.stats.mirroringizabilityPercent < 95) {
    return 'Workspace owners and admins can inspect meter usage mirroringizability below the 95% target and refresh the mirroringizability summary.'
  }

  return 'Workspace owners and admins can inspect workspace mirroringizability coverage and refresh the mirroringizability summary.'
}

export function resolveMirroringizabilityAdminActions(): MirroringizabilityAdminAction[] {
  return ['refresh_mirroringizability_summary']
}
