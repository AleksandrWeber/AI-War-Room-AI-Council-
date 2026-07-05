import type {
  IncidentAdminAction,
  IncidentAdminRecord,
  IncidentAdminStats,
} from '@ai-war-room/schemas'

export type WorkspaceIncidentDomainInventory = {
  domain: IncidentAdminRecord['domain']
  tableName: string
  recordCount: number
  tableExists: boolean
}

export function buildIncidentAdminRecords(
  inventory: WorkspaceIncidentDomainInventory[],
): IncidentAdminRecord[] {
  return inventory.map((entry) => ({
    domain: entry.domain,
    tableName: entry.tableName,
    recordCount: entry.recordCount,
    tableExists: entry.tableExists,
  }))
}

export function buildIncidentAdminStats(input: {
  records: IncidentAdminRecord[]
  postgresConnectivity: boolean
  observabilityErrorEvents: number
}): IncidentAdminStats {
  const coveredDomains = input.records.filter(
    (record) => record.tableExists,
  ).length

  return {
    totalRecords: input.records.reduce(
      (total, record) => total + record.recordCount,
      0,
    ),
    coveredDomains,
    totalDomains: input.records.length,
    postgresConnectivity: input.postgresConnectivity,
    observabilityErrorEvents: input.observabilityErrorEvents,
  }
}

export function getIncidentAdminGuidance(input: { stats: IncidentAdminStats }) {
  if (!input.stats.postgresConnectivity) {
    return 'Workspace owners and admins can inspect incident metrics once PostgreSQL connectivity is available.'
  }

  if (input.stats.coveredDomains < input.stats.totalDomains) {
    return 'Workspace owners and admins can inspect partial incident coverage and refresh the incident summary.'
  }

  if (input.stats.observabilityErrorEvents > 0) {
    return 'Workspace owners and admins can inspect recent observability error events and refresh the incident summary.'
  }

  return 'Workspace owners and admins can inspect workspace incident coverage and refresh the incident summary.'
}

export function resolveIncidentAdminActions(): IncidentAdminAction[] {
  return ['refresh_incident_summary']
}
