import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { HealthService } from '../health/health.service.js'
import { ReadinessService } from '../health/readiness.service.js'
import { StreamEventBufferService } from '../persistence/stream-event-buffer.service.js'
import { PostgresService } from '../persistence/postgres.service.js'
import { DeploymentAdminService } from './deployment-admin.service.js'

function createDeploymentAdminService() {
  const configService = new ConfigService<ApiEnv>({
    NODE_ENV: 'test',
    WEB_ORIGIN: 'http://127.0.0.1:5173',
    REDIS_URL: 'redis://127.0.0.1:6379',
  })

  return new DeploymentAdminService(
    configService,
    new HealthService(),
    new ReadinessService(
      {} as PostgresService,
      new StreamEventBufferService(configService),
    ),
  )
}

describe('DeploymentAdminService', () => {
  it('reports deployment capabilities', () => {
    const service = createDeploymentAdminService()

    expect(service.getCapabilities()).toMatchObject({
      supportsDeploymentRollout: true,
      supportsDeploymentAdminTools: true,
      supportedDependencies: ['postgres', 'redis'],
    })
  })

  it('returns workspace deployment admin summary for owners', async () => {
    const service = createDeploymentAdminService()

    await expect(
      service.getWorkspaceDeploymentAdminSummary(
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
        totalDependencies: 2,
      },
    })
  })

  it('rejects deployment admin tools for members', async () => {
    const service = createDeploymentAdminService()

    await expect(
      service.getWorkspaceDeploymentAdminSummary(
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
          'Only workspace owners and admins can manage deployment health tools.',
      },
    })
  })
})
