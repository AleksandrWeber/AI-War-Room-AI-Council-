import { describe, expect, it } from 'vitest'
import {
  buildCapacityAdminRecords,
  buildCapacityAdminStats,
  getCapacityAdminGuidance,
  resolveCapacityAdminActions,
} from './capacity-admin.helpers.js'

describe('capacity admin helpers', () => {
  it('builds capacity admin records and stats', () => {
    const records = buildCapacityAdminRecords([
      {
        domain: 'active_runs',
        tableName: 'runs',
        recordCount: 2,
        tableExists: true,
      },
      {
        domain: 'completed_runs',
        tableName: 'runs',
        recordCount: 8,
        tableExists: true,
      },
    ])

    const stats = buildCapacityAdminStats({
      records,
      postgresConnectivity: true,
    })

    expect(records).toHaveLength(2)
    expect(stats).toMatchObject({
      totalRecords: 10,
      coveredDomains: 2,
      loadUtilizationPercent: 20,
    })
  })

  it('returns guidance and actions', () => {
    expect(
      getCapacityAdminGuidance({
        stats: {
          totalRecords: 0,
          coveredDomains: 0,
          totalDomains: 4,
          postgresConnectivity: false,
          loadUtilizationPercent: 0,
        },
      }),
    ).toContain('PostgreSQL connectivity')

    expect(resolveCapacityAdminActions()).toEqual(['refresh_capacity_summary'])
  })
})
