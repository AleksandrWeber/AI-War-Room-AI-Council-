import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { IdempotencyService } from '../persistence/idempotency.service.js'
import { PostgresService } from '../persistence/postgres.service.js'
import { ReliabilityAdminService } from './reliability-admin.service.js'
import { ReliabilityStatusService } from './reliability-status.service.js'

function createReliabilityAdminService() {
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

  return new ReliabilityAdminService(
    configService,
    new ReliabilityStatusService(postgresService),
    idempotencyService,
  )
}

describe('ReliabilityAdminService', () => {
  it('reports reliability capabilities', () => {
    const service = createReliabilityAdminService()

    expect(service.getCapabilities()).toMatchObject({
      supportsReliabilityRollout: true,
      supportsReliabilityAdminTools: true,
    })
  })

  it('returns workspace reliability admin summary for owners', async () => {
    const service = createReliabilityAdminService()

    await expect(
      service.getWorkspaceReliabilityAdminSummary(
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
        reliabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects reliability admin tools for members', async () => {
    const service = createReliabilityAdminService()

    await expect(
      service.getWorkspaceReliabilityAdminSummary(
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
          'Only workspace owners and admins can manage production reliability tools.',
      },
    })
  })
})
