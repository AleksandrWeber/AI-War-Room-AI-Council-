import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { ObservabilityService } from '../observability/observability.service.js'
import { PostgresService } from '../persistence/postgres.service.js'
import { IncidentAdminService } from './incident-admin.service.js'
import { IncidentStatusService } from './incident-status.service.js'

function createIncidentAdminService() {
  const configService = new ConfigService<ApiEnv>({
    NODE_ENV: 'test',
    DATABASE_URL: 'postgres://ai_war_room:ai_war_room@127.0.0.1:5432/ai_war_room',
    BILLING_NOTIFICATION_ADAPTER: 'mock',
  })

  const postgresService = {} as PostgresService
  const observabilityService = new ObservabilityService()

  return new IncidentAdminService(
    configService,
    new IncidentStatusService(postgresService),
    observabilityService,
  )
}

describe('IncidentAdminService', () => {
  it('reports incident response capabilities', () => {
    const service = createIncidentAdminService()

    expect(service.getCapabilities()).toMatchObject({
      supportsIncidentResponseRollout: true,
      supportsIncidentAdminTools: true,
    })
  })

  it('returns workspace incident admin summary for owners', async () => {
    const service = createIncidentAdminService()

    await expect(
      service.getWorkspaceIncidentAdminSummary(
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
      },
    })
  })

  it('rejects incident admin tools for members', async () => {
    const service = createIncidentAdminService()

    await expect(
      service.getWorkspaceIncidentAdminSummary(
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
          'Only workspace owners and admins can manage production incident response tools.',
      },
    })
  })
})
