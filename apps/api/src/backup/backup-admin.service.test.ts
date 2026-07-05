import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { IdempotencyService } from '../persistence/idempotency.service.js'
import { PostgresService } from '../persistence/postgres.service.js'
import { MigrationStatusService } from '../migrations/migration-status.service.js'
import { BackupAdminService } from './backup-admin.service.js'
import { BackupStatusService } from './backup-status.service.js'

function createBackupAdminService() {
  const configService = new ConfigService<ApiEnv>({
    NODE_ENV: 'test',
    DATABASE_URL: 'postgres://ai_war_room:ai_war_room@127.0.0.1:5432/ai_war_room',
  })

  const postgresService = {} as PostgresService
  const backupStatusService = new BackupStatusService(postgresService)
  const migrationStatusService = new MigrationStatusService(postgresService)
  const idempotencyService = {
    usesRedisBackedReservation: () => false,
    ping: async () => true,
  } as IdempotencyService

  return new BackupAdminService(
    configService,
    backupStatusService,
    migrationStatusService,
    idempotencyService,
  )
}

describe('BackupAdminService', () => {
  it('reports backup capabilities', () => {
    const service = createBackupAdminService()

    expect(service.getCapabilities()).toMatchObject({
      supportsBackupRollout: true,
      supportsBackupAdminTools: true,
    })
  })

  it('returns workspace backup admin summary for owners', async () => {
    const service = createBackupAdminService()

    await expect(
      service.getWorkspaceBackupAdminSummary(
        {
          userId: 'user_test',
          workspaceId: 'workspace_1',
          role: 'owner',
        },
        'workspace_1',
      ),
    ).resolves.toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalDomains: 4,
      },
    })
  })

  it('rejects backup admin tools for members', async () => {
    const service = createBackupAdminService()

    await expect(
      service.getWorkspaceBackupAdminSummary(
        {
          userId: 'user_member',
          workspaceId: 'workspace_1',
          role: 'member',
        },
        'workspace_1',
      ),
    ).rejects.toMatchObject({
      response: {
        message:
          'Only workspace owners and admins can manage production backup tools.',
      },
    })
  })
})
