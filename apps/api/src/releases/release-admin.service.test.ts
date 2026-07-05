import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { MigrationStatusService } from '../migrations/migration-status.service.js'
import { PostgresService } from '../persistence/postgres.service.js'
import { ReleaseAdminService } from './release-admin.service.js'
import { ReleaseStatusService } from './release-status.service.js'

function createReleaseAdminService() {
  const configService = new ConfigService<ApiEnv>({
    NODE_ENV: 'test',
    DATABASE_URL: 'postgres://ai_war_room:ai_war_room@127.0.0.1:5432/ai_war_room',
  })

  const postgresService = {} as PostgresService

  return new ReleaseAdminService(
    configService,
    new ReleaseStatusService(postgresService),
    new MigrationStatusService(postgresService),
  )
}

describe('ReleaseAdminService', () => {
  it('reports release capabilities', () => {
    const service = createReleaseAdminService()

    expect(service.getCapabilities()).toMatchObject({
      supportsReleaseRollout: true,
      supportsReleaseAdminTools: true,
    })
  })

  it('returns workspace release admin summary for owners', async () => {
    const service = createReleaseAdminService()

    await expect(
      service.getWorkspaceReleaseAdminSummary(
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
        apiVersion: '0.0.0',
      },
    })
  })

  it('rejects release admin tools for members', async () => {
    const service = createReleaseAdminService()

    await expect(
      service.getWorkspaceReleaseAdminSummary(
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
          'Only workspace owners and admins can manage production release tools.',
      },
    })
  })
})
