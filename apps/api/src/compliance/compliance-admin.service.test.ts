import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { PostgresService } from '../persistence/postgres.service.js'
import { ComplianceAdminService } from './compliance-admin.service.js'
import { ComplianceStatusService } from './compliance-status.service.js'

function createComplianceAdminService() {
  const configService = new ConfigService<ApiEnv>({
    NODE_ENV: 'test',
    DATABASE_URL: 'postgres://ai_war_room:ai_war_room@127.0.0.1:5432/ai_war_room',
    APP_ENCRYPTION_KEY: 'local-development-encryption-key-change-me',
  })

  const postgresService = {} as PostgresService

  return new ComplianceAdminService(
    configService,
    new ComplianceStatusService(postgresService),
  )
}

describe('ComplianceAdminService', () => {
  it('reports compliance capabilities', () => {
    const service = createComplianceAdminService()

    expect(service.getCapabilities()).toMatchObject({
      supportsComplianceRollout: true,
      supportsComplianceAdminTools: true,
    })
  })

  it('returns workspace compliance admin summary for owners', async () => {
    const service = createComplianceAdminService()

    await expect(
      service.getWorkspaceComplianceAdminSummary(
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

  it('rejects compliance admin tools for members', async () => {
    const service = createComplianceAdminService()

    await expect(
      service.getWorkspaceComplianceAdminSummary(
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
          'Only workspace owners and admins can manage production compliance tools.',
      },
    })
  })
})
