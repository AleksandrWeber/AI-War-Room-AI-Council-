import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { AdvancedShieldService } from './advanced-shield.service.js'
import { DeterministicShieldClassifier } from './deterministic-shield.classifier.js'
import { ShieldAdminService } from './shield-admin.service.js'

class TestObservabilityService {
  record() {}
}

function createShieldAdminService(env: Partial<ApiEnv> = {}) {
  const configService = new ConfigService<ApiEnv>({
    NODE_ENV: 'test',
    ...env,
  })
  const classifier = new DeterministicShieldClassifier()
  const llmShieldClassifierService = {
    shouldEscalate: () => false,
    escalateIfNeeded: async ({
      baseScan,
    }: {
      baseScan: Awaited<ReturnType<DeterministicShieldClassifier['classify']>>
    }) => baseScan,
  }
  const advancedShieldService = new AdvancedShieldService(
    classifier,
    llmShieldClassifierService as never,
    new TestObservabilityService() as never,
  )

  return new ShieldAdminService(
    configService,
    advancedShieldService,
    {
      isFeatureEnabled: () => false,
      retainHours: () => 72,
      purgeExpired: async (workspaceId: string) => ({
        workspaceId,
        purgedCount: 0,
        message: 'No expired full-scan retain records to redact.',
      }),
    } as never,
  )
}

describe('ShieldAdminService', () => {
  it('reports shield capabilities', async () => {
    const service = createShieldAdminService()

    await expect(service.getCapabilities()).resolves.toMatchObject({
      supportsShieldRollout: true,
      supportsShieldReviewAdminTools: true,
      classifierId: 'deterministic-shield-fallback/v1',
    })
  })

  it('reports shield rollout readiness', async () => {
    const service = createShieldAdminService()

    await expect(service.getShieldRollout()).resolves.toMatchObject({
      status: 'ready',
      classifierId: 'deterministic-shield-fallback/v1',
    })
  })

  it('returns workspace shield review admin summary for owners', async () => {
    const service = createShieldAdminService()

    await expect(
      service.getWorkspaceShieldReviewAdminSummary(
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
        totalCases: expect.any(Number),
      },
      availableActions: ['rerun_review_summary'],
    })
  })

  it('rejects shield review admin tools for members', async () => {
    const service = createShieldAdminService()

    await expect(
      service.getWorkspaceShieldReviewAdminSummary(
        {
          userId: 'user_member',
          workspaceId: 'workspace_1',
          role: 'member',
        },
        'workspace_1',
      ),
    ).rejects.toMatchObject({
      response: {
        message: 'Only workspace owners and admins can manage Shield review tools.',
      },
    })
  })
})
