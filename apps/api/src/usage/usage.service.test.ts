import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { InMemoryUsageRepository } from './in-memory-usage.repository.js'
import { UsageService } from './usage.service.js'

function createUsageService(env: Partial<ApiEnv> = {}) {
  const config = {
    NODE_ENV: 'test',
    ...env,
  } as ApiEnv

  const configService = {
    get: (key: keyof ApiEnv) => config[key],
  } as ConfigService<ApiEnv, true>

  const repository = new InMemoryUsageRepository()

  return {
    service: new UsageService(configService, repository),
    repository,
  }
}

describe('UsageService', () => {
  it('reports usage capabilities', () => {
    const { service } = createUsageService()

    expect(service.getCapabilities()).toMatchObject({
      supportsUsageSummary: true,
      supportsUsageAdminTools: true,
    })
  })

  it('returns usage admin summary for workspace owners', async () => {
    const { service, repository } = createUsageService()

    await repository.recordUsageEvents([
      {
        usageEventId: 'usage_1',
        workspaceId: 'workspace_1',
        userId: 'user_test',
        runId: 'run_1',
        phase: 'agent',
        sourceId: 'product_manager',
        modelProvider: 'mock',
        modelName: 'mock-json-v1',
        promptVersion: 'agent/mock',
        inputTokens: 100,
        outputTokens: 50,
        estimatedCostUsd: 1,
        createdAt: '2026-07-04T12:00:00.000Z',
      },
    ])

    const summary = await service.getWorkspaceUsageAdminSummary(
      {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      'workspace_1',
    )

    expect(summary.stats.dailyEventCount).toBe(1)
    expect(summary.availableActions).toEqual(['reset_daily_usage'])
  })

  it('rejects usage admin tools for workspace members', async () => {
    const { service } = createUsageService()

    await expect(
      service.getWorkspaceUsageAdminSummary(
        {
          userId: 'user_member',
          workspaceId: 'workspace_1',
          role: 'member',
        },
        'workspace_1',
      ),
    ).rejects.toMatchObject({
      response: {
        message: 'Only workspace owners and admins can manage usage settings.',
      },
    })
  })

  it('resets daily usage through admin action', async () => {
    const { service, repository } = createUsageService()

    await repository.recordUsageEvents([
      {
        usageEventId: 'usage_reset',
        workspaceId: 'workspace_1',
        userId: 'user_test',
        runId: 'run_reset',
        phase: 'agent',
        sourceId: 'product_manager',
        modelProvider: 'mock',
        modelName: 'mock-json-v1',
        promptVersion: 'agent/mock',
        inputTokens: 100,
        outputTokens: 50,
        estimatedCostUsd: 1,
        createdAt: '2026-07-04T12:00:00.000Z',
      },
    ])

    const result = await service.executeUsageAdminAction(
      {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      {
        workspaceId: 'workspace_1',
        action: 'reset_daily_usage',
      },
    )

    expect(result.message).toContain('reset')
    expect(result.usage?.dailyUsage.totalTokens).toBe(0)
  })
})
