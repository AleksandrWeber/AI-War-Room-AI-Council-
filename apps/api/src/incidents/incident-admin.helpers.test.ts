import { describe, expect, it } from 'vitest'
import {
  buildIncidentAdminRecords,
  buildIncidentAdminStats,
  getIncidentAdminGuidance,
  resolveIncidentAdminActions,
} from './incident-admin.helpers.js'

describe('incident admin helpers', () => {
  it('builds incident admin records and stats', () => {
    const records = buildIncidentAdminRecords([
      {
        domain: 'failed_runs',
        tableName: 'runs',
        recordCount: 1,
        tableExists: true,
      },
      {
        domain: 'billing_alerts',
        tableName: 'billing_notifications',
        recordCount: 0,
        tableExists: false,
      },
    ])

    const stats = buildIncidentAdminStats({
      records,
      postgresConnectivity: true,
      observabilityErrorEvents: 2,
    })

    expect(records).toHaveLength(2)
    expect(stats).toMatchObject({
      totalRecords: 1,
      coveredDomains: 1,
      totalDomains: 2,
      observabilityErrorEvents: 2,
    })
  })

  it('returns guidance and actions', () => {
    expect(
      getIncidentAdminGuidance({
        stats: {
          totalRecords: 0,
          coveredDomains: 0,
          totalDomains: 4,
          postgresConnectivity: false,
          observabilityErrorEvents: 0,
        },
      }),
    ).toContain('PostgreSQL connectivity')

    expect(resolveIncidentAdminActions()).toEqual(['refresh_incident_summary'])
  })
})
