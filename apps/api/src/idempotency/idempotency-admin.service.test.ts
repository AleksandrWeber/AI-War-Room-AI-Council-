import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { IdempotencyService } from '../persistence/idempotency.service.js'
import { InMemoryRunRepository } from '../persistence/in-memory-run.repository.js'
import { IdempotencyAdminService } from './idempotency-admin.service.js'

function createIdempotencyAdminService() {
  const configService = new ConfigService<ApiEnv>({
    NODE_ENV: 'test',
    REDIS_URL: 'redis://127.0.0.1:6379',
    IDEMPOTENCY_TTL_SECONDS: 86_400,
  })

  return new IdempotencyAdminService(
    configService,
    new IdempotencyService(configService),
    new InMemoryRunRepository(),
  )
}

describe('IdempotencyAdminService', () => {
  it('reports idempotency capabilities', () => {
    const service = createIdempotencyAdminService()

    expect(service.getCapabilities()).toMatchObject({
      supportsIdempotencyRollout: true,
      supportsIdempotencyAdminTools: true,
      defaultReservationTtlSeconds: 86_400,
    })
  })

  it('returns workspace idempotency admin summary for owners', async () => {
    const service = createIdempotencyAdminService()

    await expect(
      service.getWorkspaceIdempotencyAdminSummary(
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
        totalKeys: expect.any(Number),
      },
    })
  })

  it('rejects idempotency admin tools for members', async () => {
    const service = createIdempotencyAdminService()

    await expect(
      service.getWorkspaceIdempotencyAdminSummary(
        {
          userId: 'user_member',
          workspaceId: 'workspace_1',
          role: 'member',
        },
        'workspace_1',
      ),
    ).rejects.toMatchObject({
      response: {
        message: 'Only workspace owners and admins can manage idempotency tools.',
      },
    })
  })
})
