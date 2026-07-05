import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { ObservabilityService } from '../observability/observability.service.js'
import { PostgresService } from '../persistence/postgres.service.js'
import { SloAdminService } from './slo-admin.service.js'
import { SloStatusService } from './slo-status.service.js'

function createSloAdminService() {
  const configService = new ConfigService<ApiEnv>({
    NODE_ENV: 'test',
    DATABASE_URL: 'postgres://ai_war_room:ai_war_room@127.0.0.1:5432/ai_war_room',
  })

  const postgresService = {} as PostgresService

  return new SloAdminService(
    configService,
    new SloStatusService(postgresService),
    new ObservabilityService(),
  )
}

describe('SloAdminService', () => {
  it('reports SLO capabilities', () => {
    const service = createSloAdminService()

    expect(service.getCapabilities()).toMatchObject({
      supportsSloRollout: true,
      supportsSloAdminTools: true,
    })
  })

  it('returns workspace SLO admin summary for owners', async () => {
    const service = createSloAdminService()

    await expect(
      service.getWorkspaceSloAdminSummary(
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
        successRatePercent: expect.any(Number),
      },
    })
  })

  it('rejects SLO admin tools for members', async () => {
    const service = createSloAdminService()

    await expect(
      service.getWorkspaceSloAdminSummary(
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
          'Only workspace owners and admins can manage production SLO tools.',
      },
    })
  })
})
