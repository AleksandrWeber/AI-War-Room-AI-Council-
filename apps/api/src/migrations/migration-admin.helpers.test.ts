import { describe, expect, it } from 'vitest'
import {
  buildMigrationAdminRecords,
  buildMigrationAdminStats,
} from './migration-admin.helpers.js'

describe('migration admin helpers', () => {
  it('builds migration admin records and stats', () => {
    const inventory = {
      availableVersions: ['001_initial_persistence.sql', '002_auth_workspaces.sql'],
      appliedVersions: [
        {
          version: '001_initial_persistence.sql',
          appliedAt: '2026-01-01T00:00:00.000Z',
        },
      ],
      pendingVersions: ['002_auth_workspaces.sql'],
      schemaMigrationsTableExists: true,
    }

    expect(buildMigrationAdminRecords(inventory)).toEqual([
      expect.objectContaining({ version: '001_initial_persistence.sql', status: 'applied' }),
      expect.objectContaining({ version: '002_auth_workspaces.sql', status: 'pending' }),
    ])
    expect(buildMigrationAdminStats(inventory)).toMatchObject({
      totalMigrations: 2,
      appliedCount: 1,
      pendingCount: 1,
    })
  })
})
