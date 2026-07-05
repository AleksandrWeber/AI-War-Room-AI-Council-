import { describe, expect, it } from 'vitest'
import {
  buildReliabilityAdminRecords,
  buildReliabilityAdminStats,
  getReliabilityAdminGuidance,
  resolveReliabilityAdminActions,
} from './reliability-admin.helpers.js'

describe('reliability admin helpers', () => {
  it('builds reliability admin records and stats', () => {
    const records = buildReliabilityAdminRecords([
      {
        domain: 'completed_runs',
        tableName: 'runs',
        recordCount: 19,
        tableExists: true,
      },
      {
        domain: 'failed_runs',
        tableName: 'runs',
        recordCount: 1,
        tableExists: true,
      },
    ])

    const stats = buildReliabilityAdminStats({
      records,
      postgresConnectivity: true,
    })

    expect(records).toHaveLength(2)
    expect(stats).toMatchObject({
      totalRecords: 20,
      coveredDomains: 2,
      reliabilityPercent: 95,
    })
  })

  it('returns guidance and actions', () => {
    expect(
      getReliabilityAdminGuidance({
        stats: {
          totalRecords: 0,
          coveredDomains: 0,
          totalDomains: 4,
          postgresConnectivity: false,
          reliabilityPercent: 100,
        },
      }),
    ).toContain('PostgreSQL connectivity')

    expect(resolveReliabilityAdminActions()).toEqual([
      'refresh_reliability_summary',
    ])
  })
})
