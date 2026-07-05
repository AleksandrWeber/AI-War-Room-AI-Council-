import { describe, expect, it } from 'vitest'
import {
  buildBackupAdminRecords,
  buildBackupAdminStats,
  getBackupAdminGuidance,
  resolveBackupAdminActions,
} from './backup-admin.helpers.js'

describe('backup admin helpers', () => {
  it('builds backup admin records and stats', () => {
    const records = buildBackupAdminRecords([
      {
        domain: 'runs',
        tableName: 'runs',
        recordCount: 3,
        tableExists: true,
      },
      {
        domain: 'artifacts',
        tableName: 'artifacts',
        recordCount: 0,
        tableExists: false,
      },
    ])

    const stats = buildBackupAdminStats({
      records,
      postgresConnectivity: true,
      redisBackedPersistence: false,
    })

    expect(records).toHaveLength(2)
    expect(stats).toMatchObject({
      totalRecords: 3,
      recoverableDomains: 1,
      totalDomains: 2,
    })
  })

  it('returns guidance and actions', () => {
    expect(
      getBackupAdminGuidance({
        stats: {
          totalRecords: 0,
          recoverableDomains: 0,
          totalDomains: 4,
          postgresConnectivity: false,
          redisBackedPersistence: false,
        },
      }),
    ).toContain('PostgreSQL connectivity')

    expect(resolveBackupAdminActions()).toEqual(['refresh_backup_summary'])
  })
})
