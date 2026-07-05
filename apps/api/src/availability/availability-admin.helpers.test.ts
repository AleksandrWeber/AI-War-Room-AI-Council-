import { describe, expect, it } from 'vitest'
import {
  buildAvailabilityAdminRecords,
  buildAvailabilityAdminStats,
  getAvailabilityAdminGuidance,
  resolveAvailabilityAdminActions,
} from './availability-admin.helpers.js'

describe('availability admin helpers', () => {
  it('builds availability admin records and stats', () => {
    const records = buildAvailabilityAdminRecords([
      {
        domain: 'completed_runs',
        tableName: 'runs',
        recordCount: 9,
        tableExists: true,
      },
      {
        domain: 'failed_runs',
        tableName: 'runs',
        recordCount: 1,
        tableExists: true,
      },
    ])

    const stats = buildAvailabilityAdminStats({
      records,
      postgresConnectivity: true,
    })

    expect(records).toHaveLength(2)
    expect(stats).toMatchObject({
      totalRecords: 10,
      coveredDomains: 2,
      availabilityPercent: 90,
    })
  })

  it('returns guidance and actions', () => {
    expect(
      getAvailabilityAdminGuidance({
        stats: {
          totalRecords: 0,
          coveredDomains: 0,
          totalDomains: 4,
          postgresConnectivity: false,
          availabilityPercent: 100,
        },
      }),
    ).toContain('PostgreSQL connectivity')

    expect(resolveAvailabilityAdminActions()).toEqual([
      'refresh_availability_summary',
    ])
  })
})
