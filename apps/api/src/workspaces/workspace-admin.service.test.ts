import { ConfigService } from '@nestjs/config'
import { describe, expect, it } from 'vitest'
import type { ApiEnv } from '../config/env.js'
import { InMemoryWorkspaceRepository } from './in-memory-workspace.repository.js'
import { WorkspaceAdminService } from './workspace-admin.service.js'

function createWorkspaceAdminService(env: Partial<ApiEnv> = {}) {
  const config = {
    NODE_ENV: 'test',
    ...env,
  } as ApiEnv

  return new WorkspaceAdminService(
    {
      get: (key: keyof ApiEnv) => config[key],
    } as ConfigService<ApiEnv, true>,
    new InMemoryWorkspaceRepository(),
  )
}

describe('WorkspaceAdminService', () => {
  it('returns workspace member admin summary for owners', async () => {
    const service = createWorkspaceAdminService()

    const summary = await service.getWorkspaceMemberAdminSummary(
      {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      'workspace_1',
    )

    expect(summary.members.length).toBeGreaterThan(1)
    expect(summary.availableActions).toEqual(
      expect.arrayContaining(['add_member', 'remove_member']),
    )
  })

  it('rejects workspace member admin tools for members', async () => {
    const service = createWorkspaceAdminService()

    await expect(
      service.getWorkspaceMemberAdminSummary(
        {
          userId: 'user_member',
          workspaceId: 'workspace_1',
          role: 'member',
        },
        'workspace_1',
      ),
    ).rejects.toMatchObject({
      response: {
        message: 'Only workspace owners and admins can manage workspace members.',
      },
    })
  })

  it('adds and removes workspace members through admin actions', async () => {
    const service = createWorkspaceAdminService()
    const authContext = {
      userId: 'user_test',
      workspaceId: 'workspace_1',
      role: 'owner' as const,
    }

    await service.executeWorkspaceMemberAdminAction(authContext, {
      workspaceId: 'workspace_1',
      action: 'add_member',
      userId: 'user_new_member',
      role: 'viewer',
      email: 'viewer@example.com',
    })

    const removeResult = await service.executeWorkspaceMemberAdminAction(
      authContext,
      {
        workspaceId: 'workspace_1',
        action: 'remove_member',
        userId: 'user_new_member',
      },
    )

    expect(removeResult.message).toContain('Removed user_new_member')
  })

  it('returns workspace settings admin summary for owners', async () => {
    const service = createWorkspaceAdminService()

    const summary = await service.getWorkspaceSettingsAdminSummary(
      {
        userId: 'user_test',
        workspaceId: 'workspace_1',
        role: 'owner',
      },
      'workspace_1',
    )

    expect(summary.settings.name).toBe('Workspace One')
    expect(summary.availableActions).toEqual(
      expect.arrayContaining(['update_workspace_name', 'reset_workspace_name']),
    )
  })

  it('updates workspace settings through admin actions', async () => {
    const service = createWorkspaceAdminService()
    const authContext = {
      userId: 'user_test',
      workspaceId: 'workspace_1',
      role: 'owner' as const,
    }

    const result = await service.executeWorkspaceSettingsAdminAction(
      authContext,
      {
        workspaceId: 'workspace_1',
        action: 'update_workspace_name',
        name: 'Renamed Workspace',
      },
    )

    expect(result.settings.name).toBe('Renamed Workspace')
  })
})
