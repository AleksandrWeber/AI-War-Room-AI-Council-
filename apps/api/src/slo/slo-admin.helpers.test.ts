import { describe, expect, it } from 'vitest'
import {
  buildSloAdminRecords,
  buildSloAdminStats,
  getSloAdminGuidance,
  resolveSloAdminActions,
} from './slo-admin.helpers.js'

describe('SLO admin helpers', () => {
  it('builds SLO admin records and stats', () => {
    const records = buildSloAdminRecords([
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

    const stats = buildSloAdminStats({
      records,
      postgresConnectivity: true,
    })

    expect(records).toHaveLength(2)
    expect(stats).toMatchObject({
      totalRecords: 10,
      coveredDomains: 2,
      successRatePercent: 90,
    })
  })

  it('returns guidance and actions', () => {
    expect(
      getSloAdminGuidance({
        stats: {
          totalRecords: 0,
          coveredDomains: 0,
          totalDomains: 4,
          postgresConnectivity: false,
          successRatePercent: 100,
        },
      }),
    ).toContain('PostgreSQL connectivity')

    expect(resolveSloAdminActions()).toEqual(['refresh_slo_summary'])
  })
})
