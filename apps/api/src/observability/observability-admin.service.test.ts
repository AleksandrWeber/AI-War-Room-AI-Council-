import { ConfigService } from '@nestjs/config'
import { describe, expect, it, vi } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { ObservabilityAdminService } from './observability-admin.service.js'
import { ObservabilityService } from './observability.service.js'

function createObservabilityAdminService(env: Partial<ApiEnv> = {}) {
  const configService = new ConfigService<ApiEnv>({
    NODE_ENV: 'test',
    TEMPORAL_ENABLED: false,
    TEMPORAL_ADDRESS: '127.0.0.1:7233',
    TEMPORAL_NAMESPACE: 'default',
    TEMPORAL_TASK_QUEUE: 'ai-war-room-runs',
    ...env,
  })
  const observabilityService = new ObservabilityService()

  return new ObservabilityAdminService(
    configService,
    observabilityService,
    {
      listWorkspaceBufferedStreams: vi.fn(async () => []),
    } as never,
    {
      getRuntimeHealth: vi.fn(async () => ({
        status: 'healthy',
        guidance: 'Temporal runtime is healthy.',
      })),
    } as never,
  )
}

describe('ObservabilityAdminService', () => {
  it('reports observability capabilities', () => {
    const service = createObservabilityAdminService()

    expect(service.getCapabilities()).toMatchObject({
      supportsObservabilityRollout: true,
      supportsObservabilityAdminTools: true,
      structuredLoggingEnabled: true,
      tracingEnabled: true,
    })
  })

  it('reports observability rollout readiness', () => {
    const service = createObservabilityAdminService()

    expect(service.getObservabilityRollout()).toMatchObject({
      status: 'ready',
    })
  })

  it('returns workspace observability admin summary for owners', async () => {
    const service = createObservabilityAdminService()

    await expect(
      service.getWorkspaceObservabilityAdminSummary(
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
        totalEvents: 0,
      },
      alerts: [],
      availableActions: ['refresh_event_summary'],
    })
  })

  it('rejects observability admin tools for members', async () => {
    const service = createObservabilityAdminService()

    await expect(
      service.getWorkspaceObservabilityAdminSummary(
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
          'Only workspace owners and admins can manage observability tools.',
      },
    })
  })
})
