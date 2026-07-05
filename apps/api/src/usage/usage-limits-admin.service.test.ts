import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { InMemoryUsageRepository } from './in-memory-usage.repository.js'
import { UsageLimitsAdminService } from './usage-limits-admin.service.js'
import { UsageService } from './usage.service.js'

function createUsageLimitsAdminService() {
  const configService = new ConfigService<ApiEnv>({
    NODE_ENV: 'test',
    IDEMPOTENCY_TTL_SECONDS: 86_400,
  })
  const usageRepository = new InMemoryUsageRepository()
  const usageService = new UsageService(configService, usageRepository)

  return new UsageLimitsAdminService(configService, usageService)
}

describe('UsageLimitsAdminService', () => {
  it('reports usage limits capabilities', () => {
    const service = createUsageLimitsAdminService()

    expect(service.getCapabilities()).toMatchObject({
      supportsUsageLimitsRollout: true,
      supportsQuotaAdminTools: true,
      supportedPaidTiers: ['free', 'pro', 'business'],
    })
  })

  it('returns workspace quota admin summary for owners', async () => {
    const service = createUsageLimitsAdminService()

    await expect(
      service.getWorkspaceQuotaAdminSummary(
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
        dailyEventCount: expect.any(Number),
      },
    })
  })

  it('rejects quota admin tools for members', async () => {
    const service = createUsageLimitsAdminService()

    await expect(
      service.getWorkspaceQuotaAdminSummary(
        {
          userId: 'user_member',
          workspaceId: 'workspace_1',
          role: 'member',
        },
        'workspace_1',
      ),
    ).rejects.toMatchObject({
      response: {
        message: 'Only workspace owners and admins can manage quota tools.',
      },
    })
  })
})
