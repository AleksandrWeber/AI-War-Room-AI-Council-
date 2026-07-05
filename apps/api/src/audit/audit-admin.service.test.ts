import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { PostgresService } from '../persistence/postgres.service.js'
import { AuditAdminService } from './audit-admin.service.js'
import { AuditStatusService } from './audit-status.service.js'

function createAuditAdminService() {
  const configService = new ConfigService<ApiEnv>({
    NODE_ENV: 'test',
    DATABASE_URL: 'postgres://ai_war_room:ai_war_room@127.0.0.1:5432/ai_war_room',
  })

  const postgresService = {} as PostgresService

  return new AuditAdminService(
    configService,
    new AuditStatusService(postgresService),
  )
}

describe('AuditAdminService', () => {
  it('reports audit trail capabilities', () => {
    const service = createAuditAdminService()

    expect(service.getCapabilities()).toMatchObject({
      supportsAuditTrailRollout: true,
      supportsAuditTrailAdminTools: true,
      supportsWorkspaceAuditExport: true,
    })
  })

  it('returns workspace audit admin summary for owners', async () => {
    const service = createAuditAdminService()

    await expect(
      service.getWorkspaceAuditAdminSummary(
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

  it('rejects audit admin tools for members', async () => {
    const service = createAuditAdminService()

    await expect(
      service.getWorkspaceAuditAdminSummary(
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
          'Only workspace owners and admins can manage production audit trail tools.',
      },
    })
  })
})
