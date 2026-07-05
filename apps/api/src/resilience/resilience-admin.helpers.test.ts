import { describe, expect, it } from 'vitest'
import {
  buildResilienceAdminRecords,
  buildResilienceAdminStats,
  getResilienceAdminGuidance,
  resolveResilienceAdminActions,
} from './resilience-admin.helpers.js'

describe('resilience admin helpers', () => {
  it('builds resilience admin records and stats', () => {
    const records = buildResilienceAdminRecords([
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

    const stats = buildResilienceAdminStats({
      records,
      postgresConnectivity: true,
    })

    expect(records).toHaveLength(2)
    expect(stats).toMatchObject({
      totalRecords: 10,
      coveredDomains: 2,
      recoveryReadinessPercent: 90,
    })
  })

  it('returns guidance and actions', () => {
    expect(
      getResilienceAdminGuidance({
        stats: {
          totalRecords: 0,
          coveredDomains: 0,
          totalDomains: 4,
          postgresConnectivity: false,
          recoveryReadinessPercent: 100,
        },
      }),
    ).toContain('PostgreSQL connectivity')

    expect(resolveResilienceAdminActions()).toEqual([
      'refresh_resilience_summary',
    ])
  })
})
