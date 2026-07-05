import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { ObservabilityAdminService } from './observability-admin.service.js'
import { ObservabilityService } from './observability.service.js'

function createObservabilityAdminService(env: Partial<ApiEnv> = {}) {
  const configService = new ConfigService<ApiEnv>({
    NODE_ENV: 'test',
    ...env,
  })
  const observabilityService = new ObservabilityService()

  return new ObservabilityAdminService(configService, observabilityService)
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

  it('returns workspace observability admin summary for owners', () => {
    const service = createObservabilityAdminService()

    expect(
      service.getWorkspaceObservabilityAdminSummary(
        {
          userId: 'user_test',
          workspaceId: 'workspace_1',
          role: 'owner',
        },
        'workspace_1',
      ),
    ).toMatchObject({
      workspaceId: 'workspace_1',
      role: 'owner',
      stats: {
        totalEvents: 0,
      },
      availableActions: ['refresh_event_summary'],
    })
  })

  it('rejects observability admin tools for members', () => {
    const service = createObservabilityAdminService()

    expect(() =>
      service.getWorkspaceObservabilityAdminSummary(
        {
          userId: 'user_member',
          workspaceId: 'workspace_1',
          role: 'member',
        },
        'workspace_1',
      ),
    ).toThrow(
      expect.objectContaining({
        response: {
          message:
            'Only workspace owners and admins can manage observability tools.',
        },
      }),
    )
  })
})
