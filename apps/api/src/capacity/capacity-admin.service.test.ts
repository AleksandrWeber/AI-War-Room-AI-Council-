import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { IdempotencyService } from '../persistence/idempotency.service.js'
import { PostgresService } from '../persistence/postgres.service.js'
import { StreamEventBufferService } from '../persistence/stream-event-buffer.service.js'
import { CapacityAdminService } from './capacity-admin.service.js'
import { CapacityStatusService } from './capacity-status.service.js'

function createCapacityAdminService() {
  const configService = new ConfigService<ApiEnv>({
    NODE_ENV: 'test',
    DATABASE_URL: 'postgres://ai_war_room:ai_war_room@127.0.0.1:5432/ai_war_room',
    REDIS_URL: 'redis://127.0.0.1:6379',
  })

  const postgresService = {} as PostgresService
  const idempotencyService = {
    usesRedisBackedReservation: () => false,
    ping: async () => true,
  } as IdempotencyService
  const streamEventBufferService = {
    usesRedisBackedBuffer: () => false,
    getStreamBufferMaxLength: () => 200,
  } as StreamEventBufferService

  return new CapacityAdminService(
    configService,
    new CapacityStatusService(postgresService),
    idempotencyService,
    streamEventBufferService,
  )
}

describe('CapacityAdminService', () => {
  it('reports capacity capabilities', () => {
    const service = createCapacityAdminService()

    expect(service.getCapabilities()).toMatchObject({
      supportsCapacityRollout: true,
      supportsCapacityAdminTools: true,
    })
  })

  it('returns workspace capacity admin summary for owners', async () => {
    const service = createCapacityAdminService()

    await expect(
      service.getWorkspaceCapacityAdminSummary(
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
        loadUtilizationPercent: expect.any(Number),
      },
    })
  })

  it('rejects capacity admin tools for members', async () => {
    const service = createCapacityAdminService()

    await expect(
      service.getWorkspaceCapacityAdminSummary(
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
          'Only workspace owners and admins can manage production capacity tools.',
      },
    })
  })
})
