import { describe, expect, it } from 'vitest'
import { InMemoryUsageRepository } from '../usage/in-memory-usage.repository.js'
import { WorkspaceAuditService } from './workspace-audit.service.js'

describe('WorkspaceAuditService', () => {
  it('exports workspace audit data for owners', async () => {
    const usageRepository = new InMemoryUsageRepository()
    const service = new WorkspaceAuditService(usageRepository, {
      listWorkspaceWebhookEvents: async (workspaceId: string) => ({
        workspaceId,
        events: [],
      }),
      listWorkspaceNotifications: async (workspaceId: string) => ({
        workspaceId,
        notifications: [],
      }),
      listWorkspaceMeterUsageReports: async (workspaceId: string) => ({
        workspaceId,
        reports: [],
      }),
    } as never)

    const exported = await service.exportWorkspaceAudit(
      {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      'workspace_1',
      'json',
    )

    expect(exported.contentType).toContain('application/json')
    expect(JSON.parse(exported.body)).toMatchObject({
      workspaceId: 'workspace_1',
      stats: {
        usageEventCount: 0,
      },
    })
  })

  it('rejects workspace audit export for members', async () => {
    const service = new WorkspaceAuditService(
      new InMemoryUsageRepository(),
      {} as never,
    )

    await expect(
      service.exportWorkspaceAudit(
        {
          userId: 'user_member',
          workspaceId: 'workspace_1',
          role: 'member',
        },
        'workspace_1',
        'csv',
      ),
    ).rejects.toMatchObject({
      response: {
        message: 'Only workspace owners and admins can export workspace audit data.',
      },
    })
  })
})
