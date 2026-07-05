import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { MigrationStatusService } from '../migrations/migration-status.service.js'
import { IdempotencyService } from '../persistence/idempotency.service.js'
import { PostgresService } from '../persistence/postgres.service.js'
import { StreamEventBufferService } from '../persistence/stream-event-buffer.service.js'
import { ResilienceAdminService } from './resilience-admin.service.js'
import { ResilienceStatusService } from './resilience-status.service.js'

function createResilienceAdminService() {
  const configService = new ConfigService<ApiEnv>({
    NODE_ENV: 'test',
    DATABASE_URL: 'postgres://ai_war_room:ai_war_room@127.0.0.1:5432/ai_war_room',
    REDIS_URL: 'redis://127.0.0.1:6379',
  })

  const postgresService = {} as PostgresService
  const migrationStatusService = {
    getMigrationInventory: async () => ({
      availableVersions: [],
      appliedVersions: [],
      pendingVersions: [],
      schemaMigrationsTableExists: false,
    }),
  } as MigrationStatusService
  const idempotencyService = {
    usesRedisBackedReservation: () => false,
    ping: async () => true,
  } as IdempotencyService
  const streamEventBufferService = {
    usesRedisBackedBuffer: () => false,
  } as StreamEventBufferService

  return new ResilienceAdminService(
    configService,
    new ResilienceStatusService(postgresService),
    migrationStatusService,
    idempotencyService,
    streamEventBufferService,
  )
}

describe('ResilienceAdminService', () => {
  it('reports resilience capabilities', () => {
    const service = createResilienceAdminService()

    expect(service.getCapabilities()).toMatchObject({
      supportsResilienceRollout: true,
      supportsResilienceAdminTools: true,
    })
  })

  it('returns workspace resilience admin summary for owners', async () => {
    const service = createResilienceAdminService()

    await expect(
      service.getWorkspaceResilienceAdminSummary(
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
        recoveryReadinessPercent: expect.any(Number),
      },
    })
  })

  it('rejects resilience admin tools for members', async () => {
    const service = createResilienceAdminService()

    await expect(
      service.getWorkspaceResilienceAdminSummary(
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
          'Only workspace owners and admins can manage production resilience tools.',
      },
    })
  })
})
