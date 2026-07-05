import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { HealthService } from '../health/health.service.js'
import { ReadinessService } from '../health/readiness.service.js'
import { PostgresService } from '../persistence/postgres.service.js'
import { AvailabilityAdminService } from './availability-admin.service.js'
import { AvailabilityStatusService } from './availability-status.service.js'

function createAvailabilityAdminService() {
  const configService = new ConfigService<ApiEnv>({
    NODE_ENV: 'test',
    DATABASE_URL: 'postgres://ai_war_room:ai_war_room@127.0.0.1:5432/ai_war_room',
  })

  const postgresService = {} as PostgresService
  const readinessService = {
    getReadiness: async () => ({
      service: 'ai-war-room-api',
      status: 'ready',
      dependencies: [
        { name: 'postgres', status: 'up' },
        { name: 'redis', status: 'up' },
      ],
      checkedAt: new Date().toISOString(),
    }),
  } as ReadinessService

  return new AvailabilityAdminService(
    configService,
    new AvailabilityStatusService(postgresService),
    new HealthService(),
    readinessService,
  )
}

describe('AvailabilityAdminService', () => {
  it('reports availability capabilities', () => {
    const service = createAvailabilityAdminService()

    expect(service.getCapabilities()).toMatchObject({
      supportsAvailabilityRollout: true,
      supportsAvailabilityAdminTools: true,
    })
  })

  it('returns workspace availability admin summary for owners', async () => {
    const service = createAvailabilityAdminService()

    await expect(
      service.getWorkspaceAvailabilityAdminSummary(
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
        availabilityPercent: expect.any(Number),
      },
    })
  })

  it('rejects availability admin tools for members', async () => {
    const service = createAvailabilityAdminService()

    await expect(
      service.getWorkspaceAvailabilityAdminSummary(
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
          'Only workspace owners and admins can manage production availability tools.',
      },
    })
  })
})
