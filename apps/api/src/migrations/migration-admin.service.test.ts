import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { PostgresService } from '../persistence/postgres.service.js'
import { MigrationAdminService } from './migration-admin.service.js'
import { MigrationStatusService } from './migration-status.service.js'

function createMigrationAdminService() {
  const configService = new ConfigService<ApiEnv>({
    NODE_ENV: 'test',
    DATABASE_URL: 'postgres://ai_war_room:ai_war_room@127.0.0.1:5432/ai_war_room',
  })

  return new MigrationAdminService(
    configService,
    new MigrationStatusService({} as PostgresService),
  )
}

describe('MigrationAdminService', () => {
  it('reports migration capabilities', () => {
    const service = createMigrationAdminService()

    expect(service.getCapabilities()).toMatchObject({
      supportsMigrationRollout: true,
      supportsMigrationAdminTools: true,
    })
  })

  it('returns workspace migration admin summary for owners', async () => {
    const service = createMigrationAdminService()

    await expect(
      service.getWorkspaceMigrationAdminSummary(
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
        totalMigrations: expect.any(Number),
      },
    })
  })

  it('rejects migration admin tools for members', async () => {
    const service = createMigrationAdminService()

    await expect(
      service.getWorkspaceMigrationAdminSummary(
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
          'Only workspace owners and admins can manage database migration tools.',
      },
    })
  })
})
