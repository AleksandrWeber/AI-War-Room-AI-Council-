import { describe, expect, it } from 'vitest'
import {
  buildReleaseAdminRecords,
  buildReleaseAdminStats,
  getReleaseAdminGuidance,
  resolveReleaseAdminActions,
} from './release-admin.helpers.js'

describe('release admin helpers', () => {
  it('builds release admin records and stats', () => {
    const records = buildReleaseAdminRecords([
      {
        domain: 'completed_runs',
        tableName: 'runs',
        recordCount: 4,
        tableExists: true,
      },
      {
        domain: 'artifacts',
        tableName: 'artifacts',
        recordCount: 0,
        tableExists: false,
      },
    ])

    const stats = buildReleaseAdminStats({
      records,
      postgresConnectivity: true,
      apiVersion: '0.0.0',
    })

    expect(records).toHaveLength(2)
    expect(stats).toMatchObject({
      totalRecords: 4,
      coveredDomains: 1,
      totalDomains: 2,
      apiVersion: '0.0.0',
    })
  })

  it('returns guidance and actions', () => {
    expect(
      getReleaseAdminGuidance({
        stats: {
          totalRecords: 0,
          coveredDomains: 0,
          totalDomains: 4,
          postgresConnectivity: false,
          apiVersion: '0.0.0',
        },
      }),
    ).toContain('PostgreSQL connectivity')

    expect(resolveReleaseAdminActions()).toEqual(['refresh_release_summary'])
  })
})
