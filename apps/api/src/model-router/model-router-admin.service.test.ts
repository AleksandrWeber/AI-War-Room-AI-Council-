import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import type { ObservabilityEvent } from '../observability/observability.service.js'
import { InMemoryModelRegistryRepository } from './in-memory-model-registry.repository.js'
import { ModelRouterAdminService } from './model-router-admin.service.js'
import { ModelRouterService } from './model-router.service.js'

class TestObservability {
  record(
    eventName: string,
    attributes: ObservabilityEvent['attributes'],
    level: ObservabilityEvent['level'] = 'info',
  ) {
    return {
      eventName,
      level,
      timestamp: new Date().toISOString(),
      attributes,
    }
  }
}

function createModelRouterAdminService(env: Partial<ApiEnv> = {}) {
  const config = {
    NODE_ENV: 'test',
    LLM_PRIMARY_PROVIDER: 'mock',
    LLM_FALLBACK_PROVIDER: 'mock',
    ...env,
  } as ApiEnv
  const modelRouterService = new ModelRouterService(
    new TestObservability() as never,
    new InMemoryModelRegistryRepository(),
    {
      get: (key: keyof ApiEnv) => config[key],
    } as ConfigService<ApiEnv, true>,
  )

  return new ModelRouterAdminService(
    {
      get: (key: keyof ApiEnv) => config[key],
    } as ConfigService<ApiEnv, true>,
    modelRouterService,
  )
}

describe('ModelRouterAdminService', () => {
  it('returns model health admin summary for owners', async () => {
    const service = createModelRouterAdminService()

    const summary = await service.getWorkspaceModelHealthAdminSummary(
      {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      'workspace_1',
    )

    expect(summary.models.length).toBeGreaterThan(0)
    expect(summary.stats.totalModels).toBeGreaterThan(0)
  })

  it('rejects model health admin tools for members', async () => {
    const service = createModelRouterAdminService()

    await expect(
      service.getWorkspaceModelHealthAdminSummary(
        {
          userId: 'user_member',
          workspaceId: 'workspace_1',
          role: 'member',
        },
        'workspace_1',
      ),
    ).rejects.toMatchObject({
      response: {
        message: 'Only workspace owners and admins can manage model health.',
      },
    })
  })

  it('recovers degraded models through admin actions', async () => {
    const service = createModelRouterAdminService()
    const authContext = {
      userId: 'user_test',
      workspaceId: 'workspace_1',
      role: 'owner' as const,
    }
    const router = (service as unknown as { modelRouterService: ModelRouterService })
      .modelRouterService

    await router.markModelDegraded('mock-json-v1-primary')

    const result = await service.executeModelHealthAdminAction(authContext, {
      workspaceId: 'workspace_1',
      action: 'recover_model',
      modelId: 'mock-json-v1-primary',
    })

    expect(result.model?.healthStatus).toBe('healthy')
  })
})
