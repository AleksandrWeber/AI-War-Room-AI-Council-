import { describe, expect, it } from 'vitest'
import {
  buildComplianceAdminRecords,
  buildComplianceAdminStats,
  getComplianceAdminGuidance,
  resolveComplianceAdminActions,
} from './compliance-admin.helpers.js'

describe('compliance admin helpers', () => {
  it('builds compliance admin records and stats', () => {
    const records = buildComplianceAdminRecords([
      {
        domain: 'shield_reviews',
        tableName: 'shield_scans',
        recordCount: 2,
        tableExists: true,
      },
      {
        domain: 'billing_records',
        tableName: 'billing_records',
        recordCount: 0,
        tableExists: false,
      },
    ])

    const stats = buildComplianceAdminStats({
      records,
      postgresConnectivity: true,
      encryptionKeyConfigured: true,
    })

    expect(records).toHaveLength(2)
    expect(stats).toMatchObject({
      totalRecords: 2,
      coveredDomains: 1,
      totalDomains: 2,
    })
  })

  it('returns guidance and actions', () => {
    expect(
      getComplianceAdminGuidance({
        stats: {
          totalRecords: 0,
          coveredDomains: 0,
          totalDomains: 4,
          postgresConnectivity: false,
          encryptionKeyConfigured: true,
        },
      }),
    ).toContain('PostgreSQL connectivity')

    expect(resolveComplianceAdminActions()).toEqual([
      'refresh_compliance_summary',
    ])
  })
})
