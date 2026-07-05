import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { ObservabilityService } from '../observability/observability.service.js'
import { PostgresService } from '../persistence/postgres.service.js'
import { PerformanceAdminService } from './performance-admin.service.js'
import { PerformanceStatusService } from './performance-status.service.js'

function createPerformanceAdminService() {
  const configService = new ConfigService<ApiEnv>({
    NODE_ENV: 'test',
    DATABASE_URL: 'postgres://ai_war_room:ai_war_room@127.0.0.1:5432/ai_war_room',
  })

  const postgresService = {} as PostgresService

  return new PerformanceAdminService(
    configService,
    new PerformanceStatusService(postgresService),
    new ObservabilityService(),
  )
}

describe('PerformanceAdminService', () => {
  it('reports performance capabilities', () => {
    const service = createPerformanceAdminService()

    expect(service.getCapabilities()).toMatchObject({
      supportsPerformanceRollout: true,
      supportsPerformanceAdminTools: true,
    })
  })

  it('returns workspace performance admin summary for owners', async () => {
    const service = createPerformanceAdminService()

    await expect(
      service.getWorkspacePerformanceAdminSummary(
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
        averageLatencyMs: expect.any(Number),
        latencySignalPercent: expect.any(Number),
      },
    })
  })

  it('rejects performance admin tools for members', async () => {
    const service = createPerformanceAdminService()

    await expect(
      service.getWorkspacePerformanceAdminSummary(
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
          'Only workspace owners and admins can manage production performance tools.',
      },
    })
  })
})
