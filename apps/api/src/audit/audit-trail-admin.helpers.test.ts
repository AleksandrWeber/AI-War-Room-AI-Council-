import { describe, expect, it } from 'vitest'
import {
  buildAuditTrailAdminRecords,
  buildAuditTrailAdminStats,
  getAuditTrailAdminGuidance,
  resolveAuditTrailAdminActions,
} from './audit-trail-admin.helpers.js'

describe('audit trail admin helpers', () => {
  it('builds audit trail admin records and stats', () => {
    const records = buildAuditTrailAdminRecords([
      {
        domain: 'usage_events',
        tableName: 'usage_events',
        recordCount: 5,
        tableExists: true,
      },
      {
        domain: 'billing_webhook_events',
        tableName: 'billing_webhook_events',
        recordCount: 0,
        tableExists: false,
      },
    ])

    const stats = buildAuditTrailAdminStats({
      records,
      postgresConnectivity: true,
    })

    expect(records).toHaveLength(2)
    expect(stats).toMatchObject({
      totalRecords: 5,
      coveredDomains: 1,
      totalDomains: 2,
      supportsWorkspaceAuditExport: true,
    })
  })

  it('returns guidance and actions', () => {
    expect(
      getAuditTrailAdminGuidance({
        stats: {
          totalRecords: 0,
          coveredDomains: 0,
          totalDomains: 4,
          postgresConnectivity: false,
          supportsWorkspaceAuditExport: true,
        },
      }),
    ).toContain('PostgreSQL connectivity')

    expect(resolveAuditTrailAdminActions()).toEqual(['refresh_audit_summary'])
  })
})
